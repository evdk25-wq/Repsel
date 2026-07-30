use crate::domain::models::Document;
use std::fs;
use std::path::Path;

pub fn save_document(path: &Path, content: &str) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

pub fn save_binary_file(path: &Path, bytes: &[u8]) -> Result<(), String> {
    fs::write(path, bytes).map_err(|e| e.to_string())
}

pub fn load_document(path: &Path) -> Result<Document, String> {
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    Ok(Document {
        id: path.to_string_lossy().into_owned(),
        title: path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("Untitled")
            .to_string(),
        content,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;
    use std::fs;

    #[test]
    fn test_save_and_load_document() {
        let mut temp_path = env::temp_dir();
        temp_path.push("repsel_test_doc.md");
        let test_content = "# Hello Repsel\nThis is a test.";

        let save_result = save_document(&temp_path, test_content);
        assert!(save_result.is_ok(), "Failed to save document");

        let load_result = load_document(&temp_path);
        assert!(load_result.is_ok(), "Failed to load document");

        let doc = load_result.unwrap();
        assert_eq!(doc.content, test_content);
        assert_eq!(doc.title, "repsel_test_doc.md");

        let _ = fs::remove_file(temp_path);
    }
}
