package com.example.takiplay.ui.screens.mesa.components

import android.media.MediaPlayer
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import android.util.Log
import coil.compose.AsyncImage
import com.example.takiplay.data.model.Song
import com.example.takiplay.ui.components.LanguageBadge
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Strings
import com.example.takiplay.util.coverUrlFor
import com.example.takiplay.util.demoUrlFor
import com.example.takiplay.util.formatDuration

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SongDetailSheet(
    song: Song?,
    isOpen: Boolean,
    pendingCount: Int,
    isSessionReady: Boolean,
    isRequesting: Boolean,
    t: Strings,
    onRequest: (Song) -> Unit,
    onClose: () -> Unit,
) {
    if (!isOpen || song == null) return

    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val queueFull = pendingCount >= 10

    // Audio player state
    var mediaPlayer by remember { mutableStateOf<MediaPlayer?>(null) }
    var isPlaying by remember { mutableStateOf(false) }
    var isLoadingAudio by remember { mutableStateOf(false) }
    var audioError by remember { mutableStateOf(false) }
    var imageFailed by remember(song.id) { mutableStateOf(false) }

    DisposableEffect(song.id) {
        onDispose {
            mediaPlayer?.release()
            mediaPlayer = null
            isPlaying = false
        }
    }

    ModalBottomSheet(
        onDismissRequest = {
            mediaPlayer?.release()
            mediaPlayer = null
            isPlaying = false
            onClose()
        },
        sheetState = sheetState,
        containerColor = DarkSurface,
        contentColor = WarmWhite,
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp)
                .verticalScroll(rememberScrollState()),
        ) {
            // Song header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.Top,
            ) {
                Box(
                    modifier = Modifier
                        .size(88.dp)
                        .background(DarkBase, RoundedCornerShape(12.dp))
                        .border(1.dp, DarkBorder, RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center,
                ) {
                    if (!imageFailed) {
                        AsyncImage(
                            model = coverUrlFor(song.id),
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize(),
                            onError = { imageFailed = true },
                        )
                    } else {
                        Icon(Icons.Default.MusicNote, contentDescription = null,
                            tint = SoilBrown, modifier = Modifier.size(32.dp))
                    }
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(song.title, color = WarmWhite, fontSize = 20.sp, fontWeight = FontWeight.Bold,
                        maxLines = 2, overflow = TextOverflow.Ellipsis)
                    Text(song.artist, color = SandBeige, fontSize = 13.sp)
                    song.album?.let { Text(it, color = SoilBrown, fontSize = 11.sp) }
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        LanguageBadge(song.language)
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(Icons.Default.Timer, contentDescription = null, tint = SoilBrown, modifier = Modifier.size(12.dp))
                            Text(formatDuration(song.duration), color = SoilBrown, fontSize = 11.sp)
                        }
                    }
                }
            }

            Spacer(Modifier.height(20.dp))

            // Demo player
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DarkBase, RoundedCornerShape(12.dp))
                    .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
                    .padding(14.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Icon(Icons.Default.PlayCircle, contentDescription = null, tint = SoilBrown, modifier = Modifier.size(14.dp))
                    Text(t.preview, color = SoilBrown, fontSize = 11.sp)
                }
                Spacer(Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    IconButton(
                        enabled = !isLoadingAudio,
                        onClick = {
                            if (isPlaying) {
                                mediaPlayer?.pause()
                                isPlaying = false
                            } else if (mediaPlayer != null) {
                                mediaPlayer?.start()
                                isPlaying = true
                            } else {
                                audioError = false
                                isLoadingAudio = true
                                try {
                                    mediaPlayer = MediaPlayer().apply {
                                        setDataSource(demoUrlFor(song.id))
                                        setOnPreparedListener {
                                            isLoadingAudio = false
                                            it.start()
                                            isPlaying = true
                                        }
                                        setOnCompletionListener {
                                            isPlaying = false
                                        }
                                        setOnErrorListener { _, _, _ ->
                                            isLoadingAudio = false
                                            isPlaying = false
                                            audioError = true
                                            true
                                        }
                                        prepareAsync()
                                    }
                                } catch (e: Exception) {
                                    Log.e("SongDetailSheet", "Error al preparar el audio", e)
                                    isLoadingAudio = false
                                    audioError = true
                                    mediaPlayer?.release()
                                    mediaPlayer = null
                                }
                            }
                        },
                        modifier = Modifier
                            .size(48.dp)
                            .background(IncaGold.copy(alpha = 0.15f), RoundedCornerShape(24.dp))
                            .border(1.dp, IncaGold.copy(alpha = 0.4f), RoundedCornerShape(24.dp))
                    ) {
                        if (isLoadingAudio) {
                            CircularProgressIndicator(color = IncaGold, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                        } else {
                            Icon(
                                imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = null,
                                tint = IncaGold,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                    }
                    Spacer(Modifier.width(16.dp))
                    Text(
                        text = when {
                            audioError -> "No se pudo cargar el demo"
                            isLoadingAudio -> "Cargando demo..."
                            isPlaying -> "Reproduciendo demo..."
                            else -> "Demo disponible"
                        },
                        color = when {
                            audioError -> AmberWarn
                            isPlaying -> IncaGold
                            else -> SoilBrown
                        },
                        fontSize = 12.sp
                    )
                }
            }

            // Lyrics
            if (!song.lyrics.isNullOrBlank()) {
                Spacer(Modifier.height(12.dp))
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(DarkBase, RoundedCornerShape(12.dp))
                        .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
                        .padding(14.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Icon(Icons.Default.Notes, contentDescription = null, tint = SoilBrown, modifier = Modifier.size(14.dp))
                        Text(t.lyrics, color = SoilBrown, fontSize = 11.sp)
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text      = song.lyrics,
                        color     = WarmWhite,
                        fontSize  = 13.sp,
                        lineHeight = 20.sp,
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // Warnings
            if (!isSessionReady) {
                WarningBanner(t.connecting)
                Spacer(Modifier.height(10.dp))
            } else if (queueFull) {
                WarningBanner(t.queueFull)
                Spacer(Modifier.height(10.dp))
            }

            // Action buttons
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedButton(
                    onClick = onClose,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = SandBeige),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Text(t.close)
                }
                Button(
                    onClick = { onRequest(song) },
                    modifier = Modifier.weight(1f),
                    enabled = !queueFull && isSessionReady && !isRequesting,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = IncaGold,
                        contentColor   = DarkBase,
                        disabledContainerColor = DarkBorder,
                        disabledContentColor = SoilBrown,
                    ),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    if (isRequesting) {
                        CircularProgressIndicator(color = DarkBase, modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                    } else {
                        Text(t.requestSong, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun WarningBanner(message: String) {
    Text(
        text = message,
        color = AmberWarn,
        fontSize = 12.sp,
        modifier = Modifier
            .fillMaxWidth()
            .background(AmberBg, RoundedCornerShape(10.dp))
            .border(1.dp, AmberWarn.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
            .padding(12.dp)
    )
}
