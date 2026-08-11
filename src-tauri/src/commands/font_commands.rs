use serde::Serialize;
use std::collections::BTreeMap;
use std::process::Command;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemFont {
    family: String,
    monospace: bool,
}

fn parse_font_list(output: &str) -> Vec<SystemFont> {
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

#[tauri::command]
pub fn list_system_fonts() -> Result<Vec<SystemFont>, String> {
    let output = Command::new("fc-list")
        .args(["--format", "%{family[0]}\\t%{spacing}\\n"])
        .output()
        .map_err(|error| format!("Unable to query installed fonts: {error}"))?;

    if !output.status.success() {
        return Err("Fontconfig could not list installed fonts".to_string());
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|_| "Fontconfig returned invalid text".to_string())?;
    Ok(parse_font_list(&stdout))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_and_deduplicates_fontconfig_output() {
        let fonts = parse_font_list("Source Serif 4\t0\nIBM Plex Mono\t100\nIBM Plex Mono\t0\n");
        assert_eq!(fonts.len(), 2);
        assert_eq!(fonts[0].family, "IBM Plex Mono");
        assert!(fonts[0].monospace);
    }
}
