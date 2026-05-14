package com.example.takiplay.ui.screens.dj.dashboard.dialogs

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.takiplay.data.model.Language
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Strings

@Composable
fun SongFormFields(
    title: String, onTitle: (String) -> Unit,
    artist: String, onArtist: (String) -> Unit,
    album: String, onAlbum: (String) -> Unit,
    genre: String, onGenre: (String) -> Unit,
    language: String, onLanguage: (String) -> Unit,
    duration: String, onDuration: (String) -> Unit,
    demoUrl: String, onDemoUrl: (String) -> Unit,
    fullUrl: String, onFullUrl: (String) -> Unit,
    coverUrl: String, onCoverUrl: (String) -> Unit,
    lyrics: String, onLyrics: (String) -> Unit,
    t: Strings,
) {
    FormField(label = "Título *", value = title, onChange = onTitle)
    FormField(label = "Artista *", value = artist, onChange = onArtist)
    FormField(label = "Álbum", value = album, onChange = onAlbum)
    FormField(label = "Género", value = genre, onChange = onGenre)

    // Language selector
    Column {
        Text(t.colLanguage, color = SoilBrown, fontSize = 11.sp)
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            val langs = listOf(Language.SPANISH to "ES", Language.KICHWA to "KI",
                Language.ACHUAR to "SH", Language.OTHER to "+")
            langs.forEach { (value, label) ->
                FilterChip(
                    selected = language == value,
                    onClick = { onLanguage(value) },
                    label = { Text(label, fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = IncaGold,
                        selectedLabelColor     = DarkBase,
                        containerColor         = DarkBase,
                        labelColor             = SoilBrown,
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        enabled = true, selected = language == value,
                        borderColor = DarkBorder, selectedBorderColor = IncaGold,
                    ),
                )
            }
        }
    }

    FormField(label = "Duración (segundos) *", value = duration, onChange = onDuration,
        keyboardType = KeyboardType.Number)
    FormField(label = "URL Demo *", value = demoUrl, onChange = onDemoUrl)
    FormField(label = "URL Canción Completa", value = fullUrl, onChange = onFullUrl)
    FormField(label = "URL Portada", value = coverUrl, onChange = onCoverUrl)

    // Lyrics multiline
    OutlinedTextField(
        value = lyrics,
        onValueChange = onLyrics,
        label = { Text("Letra", fontSize = 11.sp) },
        modifier = Modifier.fillMaxWidth().height(100.dp),
        maxLines = 5,
        colors = textFieldColors(),
        shape = RoundedCornerShape(8.dp),
    )
}

@Composable
fun FormField(
    label: String,
    value: String,
    onChange: (String) -> Unit,
    keyboardType: KeyboardType = KeyboardType.Text,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        label = { Text(label, fontSize = 11.sp) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        colors = textFieldColors(),
        shape = RoundedCornerShape(8.dp),
    )
}

@Composable
fun textFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor    = IncaGold,
    unfocusedBorderColor  = DarkBorder,
    focusedTextColor      = WarmWhite,
    unfocusedTextColor    = WarmWhite,
    focusedLabelColor     = IncaGold,
    unfocusedLabelColor   = SoilBrown,
    cursorColor           = IncaGold,
    focusedContainerColor = DarkBase,
    unfocusedContainerColor = DarkBase,
)
