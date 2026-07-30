pub mod commands;
pub mod domain;
pub mod use_cases;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(commands::file_commands::ApprovedPaths::default())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::file_commands::select_document,
            commands::file_commands::select_markdown_destination,
            commands::file_commands::select_pdf_destination,
            commands::file_commands::save_document,
            commands::file_commands::load_document,
            commands::file_commands::save_binary_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
