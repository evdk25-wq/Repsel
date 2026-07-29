use crate::domain::models::Document;
use crate::use_cases::file_operations;

#[tauri::command]
pub fn save_document(path: String, content: String) -> Result<(), String> {
    file_operations::save_document(&path, &content)
}

#[tauri::command]
pub fn load_document(path: String) -> Result<Document, String> {
    file_operations::load_document(&path)
}

#[tauri::command]
pub fn save_binary_file(path: String, bytes: Vec<u8>) -> Result<(), String> {
    file_operations::save_binary_file(&path, &bytes)
}
