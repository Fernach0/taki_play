package com.example.takiplay.ui.screens.dj.dashboard.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.takiplay.data.model.Song
import com.example.takiplay.data.model.UpdateSongDto
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Strings

@Composable
fun EditSongDialog(song: Song, t: Strings, onConfirm: (UpdateSongDto) -> Unit, onDismiss: () -> Unit) {
    var title    by remember { mutableStateOf(song.title) }
    var artist   by remember { mutableStateOf(song.artist) }
    var album    by remember { mutableStateOf(song.album ?: "") }
    var genre    by remember { mutableStateOf(song.genre) }
    var language by remember { mutableStateOf(song.language) }
    var duration by remember { mutableStateOf(song.duration.toString()) }
    var demoUrl  by remember { mutableStateOf(song.demoUrl ?: "") }
    var fullUrl  by remember { mutableStateOf(song.fullUrl ?: "") }
    var coverUrl by remember { mutableStateOf(song.coverUrl ?: "") }
    var lyrics   by remember { mutableStateOf(song.lyrics ?: "") }
    var isActive by remember { mutableStateOf(song.isActive) }
    var error    by remember { mutableStateOf<String?>(null) }

    Dialog(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(DarkSurface, RoundedCornerShape(16.dp))
                .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
                .padding(20.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text("Editar: ${song.title}", color = WarmWhite, fontWeight = FontWeight.Bold, fontSize = 16.sp)

            SongFormFields(
                title = title, onTitle = { title = it },
                artist = artist, onArtist = { artist = it },
                album = album, onAlbum = { album = it },
                genre = genre, onGenre = { genre = it },
                language = language, onLanguage = { language = it },
                duration = duration, onDuration = { duration = it },
                demoUrl = demoUrl, onDemoUrl = { demoUrl = it },
                fullUrl = fullUrl, onFullUrl = { fullUrl = it },
                coverUrl = coverUrl, onCoverUrl = { coverUrl = it },
                lyrics = lyrics, onLyrics = { lyrics = it },
                t = t,
            )

            // isActive toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(if (isActive) t.statusActive else t.statusInactive,
                    color = if (isActive) VerdeKitu else SoilBrown, fontSize = 13.sp)
                Switch(
                    checked = isActive,
                    onCheckedChange = { isActive = it },
                    colors = SwitchDefaults.colors(checkedThumbColor = IncaGold, checkedTrackColor = IncaGold.copy(0.4f))
                )
            }

            if (error != null) Text(error!!, color = RojoSangay, fontSize = 12.sp)

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = onDismiss,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = SandBeige),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
                    shape = RoundedCornerShape(8.dp),
                ) { Text(t.close) }

                Button(
                    onClick = {
                        if (title.isBlank() || artist.isBlank() || demoUrl.isBlank() || duration.isBlank()) {
                            error = "Campos requeridos incompletos"; return@Button
                        }
                        val dur = duration.toIntOrNull()
                        if (dur == null) { error = "Duración debe ser número"; return@Button }
                        onConfirm(UpdateSongDto(
                            title = title.trim(), artist = artist.trim(),
                            album = album.ifBlank { null }, genre = genre.trim(),
                            language = language, duration = dur,
                            demoUrl = demoUrl.trim(), fullUrl = fullUrl.ifBlank { null },
                            coverUrl = coverUrl.ifBlank { null }, lyrics = lyrics.ifBlank { null },
                            isActive = isActive,
                        ))
                    },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = IncaGold, contentColor = DarkBase),
                    shape = RoundedCornerShape(8.dp),
                ) { Text("Guardar", fontWeight = FontWeight.Bold) }
            }
        }
    }
}
