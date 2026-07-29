use std::fs;
use crate::domain::models::Document;

pub fn save_document(path: &str, content: &str) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

pub fn save_binary_file(path: &str, bytes: &[u8]) -> Result<(), String> {
    fs::write(path, bytes).map_err(|e| e.to_string())
}

pub fn load_document(path: &str) -> Result<Document, String> {
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    Ok(Document {
        id: path.to_string(),
        title: path.split('/').last().unwrap_or("Untitled").to_string(),
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
        let path_str = temp_path.to_str().unwrap();
        
        let test_content = "# Hello Repsel\nThis is a test.";
        
        let save_result = save_document(path_str, test_content);
        assert!(save_result.is_ok(), "Failed to save document");
        
        let load_result = load_document(path_str);
        assert!(load_result.is_ok(), "Failed to load document");
        
        let doc = load_result.unwrap();
        assert_eq!(doc.content, test_content);
        assert_eq!(doc.title, "repsel_test_doc.md");
        
        let _ = fs::remove_file(temp_path);
    }
}
