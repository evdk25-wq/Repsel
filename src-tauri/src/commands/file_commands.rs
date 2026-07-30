use crate::domain::models::Document;
use crate::use_cases::file_operations;
use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::{AppHandle, State};
use tauri_plugin_dialog::DialogExt;

#[derive(Default)]
pub struct ApprovedPaths {
    markdown: Mutex<HashSet<PathBuf>>,
    pdf: Mutex<HashSet<PathBuf>>,
}

fn normalize_path(path: &Path) -> Result<PathBuf, String> {
    if path.exists() {
        return path.canonicalize().map_err(|error| error.to_string());
    }

    let parent = path
        .parent()
        .ok_or_else(|| "Invalid destination path".to_string())?;
    let filename = path
        .file_name()
        .ok_or_else(|| "Invalid destination filename".to_string())?;
    let canonical_parent = parent.canonicalize().map_err(|error| error.to_string())?;
    Ok(canonical_parent.join(filename))
}

fn ensure_extension(path: PathBuf, extension: &str) -> PathBuf {
    let matches = path
        .extension()
        .and_then(|value| value.to_str())
        .is_some_and(|value| value.eq_ignore_ascii_case(extension));

    if matches {
        path
    } else {
        PathBuf::from(format!("{}.{}", path.display(), extension))
    }
}

fn approve(store: &Mutex<HashSet<PathBuf>>, path: &Path) -> Result<PathBuf, String> {
    let normalized = normalize_path(path)?;
    store
        .lock()
        .map_err(|_| "File authorization state is unavailable".to_string())?
        .insert(normalized.clone());
    Ok(normalized)
}

fn require_approved(store: &Mutex<HashSet<PathBuf>>, path: &Path) -> Result<PathBuf, String> {
    let normalized = normalize_path(path)?;
    let is_approved = store
        .lock()
        .map_err(|_| "File authorization state is unavailable".to_string())?
        .contains(&normalized);

    if is_approved {
        Ok(normalized)
    } else {
        Err("The file was not selected through Repsel".to_string())
    }
}

#[tauri::command]
pub async fn select_document(
    app: AppHandle,
    approved_paths: State<'_, ApprovedPaths>,
) -> Result<Option<String>, String> {
    let selected = app
        .dialog()
        .file()
        .add_filter("Markdown", &["md"])
        .blocking_pick_file();

    selected
        .map(|path| {
            let path = path.into_path().map_err(|error| error.to_string())?;
            let approved = approve(&approved_paths.markdown, &path)?;
            Ok(approved.to_string_lossy().into_owned())
        })
        .transpose()
}

#[tauri::command]
pub async fn select_markdown_destination(
    app: AppHandle,
    approved_paths: State<'_, ApprovedPaths>,
    default_path: String,
) -> Result<Option<String>, String> {
    let selected = app
        .dialog()
        .file()
        .add_filter("Markdown", &["md"])
        .set_file_name(default_path)
        .blocking_save_file();

    selected
        .map(|path| {
            let path = ensure_extension(path.into_path().map_err(|error| error.to_string())?, "md");
            let approved = approve(&approved_paths.markdown, &path)?;
            Ok(approved.to_string_lossy().into_owned())
        })
        .transpose()
}

#[tauri::command]
pub async fn select_pdf_destination(
    app: AppHandle,
    approved_paths: State<'_, ApprovedPaths>,
    default_path: String,
) -> Result<Option<String>, String> {
    let selected = app
        .dialog()
        .file()
        .add_filter("PDF", &["pdf"])
        .set_file_name(default_path)
        .blocking_save_file();

    selected
        .map(|path| {
            let path =
                ensure_extension(path.into_path().map_err(|error| error.to_string())?, "pdf");
            let approved = approve(&approved_paths.pdf, &path)?;
            Ok(approved.to_string_lossy().into_owned())
        })
        .transpose()
}

#[tauri::command]
pub fn save_document(
    approved_paths: State<'_, ApprovedPaths>,
    path: String,
    content: String,
) -> Result<(), String> {
    let path = require_approved(&approved_paths.markdown, Path::new(&path))?;
    file_operations::save_document(&path, &content)
}

#[tauri::command]
pub fn load_document(
    approved_paths: State<'_, ApprovedPaths>,
    path: String,
) -> Result<Document, String> {
    let path = require_approved(&approved_paths.markdown, Path::new(&path))?;
    file_operations::load_document(&path)
}

#[tauri::command]
pub fn save_binary_file(
    approved_paths: State<'_, ApprovedPaths>,
    path: String,
    bytes: Vec<u8>,
) -> Result<(), String> {
    let path = require_approved(&approved_paths.pdf, Path::new(&path))?;
    file_operations::save_binary_file(&path, &bytes)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn appends_expected_extensions() {
        assert_eq!(
            ensure_extension(PathBuf::from("/tmp/note"), "md"),
            PathBuf::from("/tmp/note.md")
        );
        assert_eq!(
            ensure_extension(PathBuf::from("/tmp/NOTE.MD"), "md"),
            PathBuf::from("/tmp/NOTE.MD")
        );
    }
}
