use serde::Serialize;
use std::collections::BTreeMap;
#[cfg(target_os = "linux")]
use std::process::Command;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemFont {
    family: String,
    monospace: bool,
}

#[cfg_attr(not(target_os = "linux"), allow(dead_code))]
fn parse_fontconfig_list(output: &str) -> Vec<SystemFont> {
    let mut fonts = BTreeMap::new();

    for line in output.lines() {
        let Some((family, spacing)) = line.split_once('\t') else {
            continue;
        };
        let family = family.trim();
        if family.is_empty() || family.len() > 120 {
            continue;
        }
        let monospace = spacing.trim().split(',').any(|value| value == "100");
        fonts
            .entry(family.to_string())
            .and_modify(|current| *current |= monospace)
            .or_insert(monospace);
    }

    fonts
        .into_iter()
        .map(|(family, monospace)| SystemFont { family, monospace })
        .collect()
}

#[cfg(target_os = "linux")]
fn system_fonts() -> Result<Vec<SystemFont>, String> {
    let output = Command::new("fc-list")
        .args(["--format", "%{family[0]}\\t%{spacing}\\n"])
        .output()
        .map_err(|error| format!("Unable to query installed fonts: {error}"))?;

    if !output.status.success() {
        return Err("Fontconfig could not list installed fonts".to_string());
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|_| "Fontconfig returned invalid text".to_string())?;
    Ok(parse_fontconfig_list(&stdout))
}

#[cfg(target_os = "macos")]
fn system_fonts() -> Result<Vec<SystemFont>, String> {
    use core_text::font;
    use core_text::font_collection;
    use core_text::font_descriptor::SymbolicTraitAccessors;

    let mut fonts = BTreeMap::new();

    for family in font_collection::get_family_names().iter() {
        let family = family.to_string();
        if family.is_empty() || family.len() > 120 {
            continue;
        }
        let monospace = font::new_from_name(&family, 12.0)
            .map(|font| font.symbolic_traits().is_monospace())
            .unwrap_or(false);
        fonts.insert(family, monospace);
    }

    Ok(fonts
        .into_iter()
        .map(|(family, monospace)| SystemFont { family, monospace })
        .collect())
}

#[cfg(not(any(target_os = "linux", target_os = "macos")))]
fn system_fonts() -> Result<Vec<SystemFont>, String> {
    Ok(Vec::new())
}

#[tauri::command]
pub fn list_system_fonts() -> Result<Vec<SystemFont>, String> {
    system_fonts()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_and_deduplicates_fontconfig_output() {
        let fonts =
            parse_fontconfig_list("Source Serif 4\t0\nIBM Plex Mono\t100\nIBM Plex Mono\t0\n");
        assert_eq!(fonts.len(), 2);
        assert_eq!(fonts[0].family, "IBM Plex Mono");
        assert!(fonts[0].monospace);
    }
}
