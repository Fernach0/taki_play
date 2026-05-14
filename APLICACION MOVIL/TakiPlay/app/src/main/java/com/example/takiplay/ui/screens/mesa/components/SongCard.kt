package com.example.takiplay.ui.screens.mesa.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.takiplay.data.model.Song
import com.example.takiplay.ui.components.LanguageBadge
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.formatDuration

@Composable
fun SongCard(song: Song, onClick: (Song) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkSurface, RoundedCornerShape(12.dp))
            .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
            .clip(RoundedCornerShape(12.dp))
            .clickable { onClick(song) }
    ) {
        // Cover image
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .background(DarkBase),
            contentAlignment = Alignment.Center,
        ) {
            if (song.coverUrl != null) {
                AsyncImage(
                    model = song.coverUrl,
                    contentDescription = song.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                )
            } else {
                // Andean geometric placeholder
                Box(contentAlignment = Alignment.Center) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .border(2.dp, IncaGold.copy(alpha = 0.3f), RoundedCornerShape(4.dp))
                    )
                    Icon(
                        imageVector = Icons.Default.MusicNote,
                        contentDescription = null,
                        tint = IncaGold.copy(alpha = 0.4f),
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
            // Language badge top-right
            LanguageBadge(
                language = song.language,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(6.dp)
            )
        }

        // Song info
        Column(modifier = Modifier.padding(10.dp)) {
            Text(
                text  = song.title,
                color = WarmWhite,
                fontSize   = 12.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines   = 1,
                overflow   = TextOverflow.Ellipsis,
            )
            Text(
                text  = song.artist,
                color = SandBeige,
                fontSize = 11.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text  = formatDuration(song.duration),
                color = SoilBrown,
                fontSize = 10.sp,
            )
        }
    }
}
