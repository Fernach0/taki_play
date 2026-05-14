package com.example.takiplay.ui.screens.dj.dashboard.tabs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.takiplay.data.model.Song
import com.example.takiplay.ui.components.LanguageBadge
import com.example.takiplay.ui.components.StatusBadge
import com.example.takiplay.ui.screens.dj.dashboard.dialogs.AddSongDialog
import com.example.takiplay.ui.screens.dj.dashboard.dialogs.EditSongDialog
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Strings
import com.example.takiplay.util.formatDuration

@Composable
fun SongsTab(t: Strings) {
    val vm: SongsTabViewModel = viewModel()
    val state by vm.state.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    var showAdd by remember { mutableStateOf(false) }
    var editSong by remember { mutableStateOf<Song?>(null) }
    var deleteSong by remember { mutableStateOf<Song?>(null) }

    LaunchedEffect(state.actionSuccess) {
        state.actionSuccess?.let { snackbarHostState.showSnackbar(it); vm.clearFeedback() }
    }
    LaunchedEffect(state.actionError) {
        state.actionError?.let { snackbarHostState.showSnackbar(it); vm.clearFeedback() }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = DarkBase,
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {

            // Header row
            Row(
                modifier = Modifier.fillMaxWidth().padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("${t.songsTitle} (${state.songs.size})",
                    color = WarmWhite, fontWeight = FontWeight.Bold, fontSize = 16.sp)

                Button(
                    onClick = { showAdd = true },
                    colors = ButtonDefaults.buttonColors(containerColor = IncaGold, contentColor = DarkBase),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(t.newSong, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }

            // Search bar
            OutlinedTextField(
                value = state.search,
                onValueChange = { vm.setSearch(it) },
                placeholder = { Text(t.djSearch, color = SoilBrown, fontSize = 13.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = SoilBrown, modifier = Modifier.size(18.dp)) },
                modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 4.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = IncaGold, unfocusedBorderColor = DarkBorder,
                    focusedTextColor = WarmWhite, unfocusedTextColor = WarmWhite,
                    cursorColor = IncaGold,
                ),
                shape = RoundedCornerShape(10.dp),
            )

            if (state.isLoading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = IncaGold)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(12.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    items(state.songs, key = { it.id }) { song ->
                        SongRow(
                            song = song,
                            t = t,
                            onEdit = { editSong = song },
                            onDelete = { deleteSong = song },
                        )
                    }
                }
            }
        }
    }

    // Add dialog
    if (showAdd) {
        AddSongDialog(
            t = t,
            onConfirm = { dto -> vm.createSong(dto) { showAdd = false } },
            onDismiss = { showAdd = false },
        )
    }

    // Edit dialog
    editSong?.let { song ->
        EditSongDialog(
            song = song,
            t = t,
            onConfirm = { dto -> vm.updateSong(song.id, dto) { editSong = null } },
            onDismiss = { editSong = null },
        )
    }

    // Delete confirmation
    deleteSong?.let { song ->
        AlertDialog(
            onDismissRequest = { deleteSong = null },
            containerColor = DarkSurface,
            title = { Text("Desactivar canción", color = WarmWhite) },
            text = { Text("¿Desactivar \"${song.title}\"?", color = SandBeige) },
            confirmButton = {
                Button(
                    onClick = { vm.deleteSong(song.id); deleteSong = null },
                    colors = ButtonDefaults.buttonColors(containerColor = KichwaRojo),
                ) { Text("Desactivar") }
            },
            dismissButton = {
                OutlinedButton(onClick = { deleteSong = null },
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = SandBeige),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                ) { Text(t.close) }
            }
        )
    }
}

@Composable
private fun SongRow(song: Song, t: Strings, onEdit: () -> Unit, onDelete: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkSurface, RoundedCornerShape(10.dp))
            .border(1.dp, DarkBorder, RoundedCornerShape(10.dp))
            .padding(10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(song.title, color = WarmWhite, fontWeight = FontWeight.Medium, fontSize = 13.sp,
                maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(song.artist, color = SandBeige, fontSize = 11.sp)
        }
        LanguageBadge(song.language)
        StatusBadge(isActive = song.isActive, activeLabel = t.statusActive, inactiveLabel = t.statusInactive)
        Text(formatDuration(song.duration), color = SoilBrown, fontSize = 11.sp)
        Row {
            IconButton(onClick = onEdit, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.Edit, contentDescription = null, tint = SelvaVerde, modifier = Modifier.size(16.dp))
            }
            IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.Delete, contentDescription = null, tint = KichwaRojo.copy(0.7f), modifier = Modifier.size(16.dp))
            }
        }
    }
}
