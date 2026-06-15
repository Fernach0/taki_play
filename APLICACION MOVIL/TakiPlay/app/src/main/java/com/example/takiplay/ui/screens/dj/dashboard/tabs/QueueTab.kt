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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.takiplay.data.model.GlobalQueueItem
import com.example.takiplay.ui.components.LanguageBadge
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Strings
import com.example.takiplay.util.coverUrlFor
import com.example.takiplay.util.timeAgo

@Composable
fun QueueTab(t: Strings) {
    val vm: QueueTabViewModel = viewModel()
    val state by vm.state.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

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
        if (state.isLoading) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = IncaGold)
            }
            return@Scaffold
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            // Now playing section
            val nowPlaying = state.allQueues.filter { it.currentlyPlaying != null }
            if (nowPlaying.isNotEmpty()) {
                item {
                    SectionHeader(icon = Icons.Default.PlayCircle, title = t.nowPlaying, tint = KichwaRojo)
                }
                items(nowPlaying) { tableItem ->
                    val cp = tableItem.currentlyPlaying!!
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(KichwaRojo.copy(alpha = 0.1f), RoundedCornerShape(12.dp))
                            .border(1.dp, KichwaRojo.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Icon(Icons.Default.MusicNote, contentDescription = null,
                            tint = KichwaRojo, modifier = Modifier.size(20.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(cp.song.title, color = WarmWhite, fontWeight = FontWeight.SemiBold,
                                fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(cp.song.artist, color = SandBeige, fontSize = 12.sp)
                        }
                        Text(
                            text = "${t.tableLabel} ${tableItem.tableNumber}",
                            color = KichwaRojo,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            modifier = Modifier
                                .background(KichwaRojo.copy(alpha = 0.2f), RoundedCornerShape(6.dp))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                        OutlinedButton(
                            onClick = { vm.markDone(cp.id) },
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = SelvaVerde),
                            border = androidx.compose.foundation.BorderStroke(1.dp, SelvaVerde.copy(alpha = 0.4f)),
                            shape = RoundedCornerShape(8.dp),
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(Modifier.width(4.dp))
                            Text(t.markDone, fontSize = 11.sp)
                        }
                    }
                }
            }

            // Global queue section
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    SectionHeader(icon = Icons.Default.People, title = t.queueRequests, tint = IncaGold)
                    Text(
                        text = "${state.globalQueue.size}",
                        color = SoilBrown,
                        fontSize = 11.sp,
                        modifier = Modifier
                            .background(DarkSurface, RoundedCornerShape(6.dp))
                            .border(1.dp, DarkBorder, RoundedCornerShape(6.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            if (state.globalQueue.isEmpty()) {
                item {
                    Box(Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.MusicOff, contentDescription = null,
                                tint = SoilBrown.copy(alpha = 0.4f), modifier = Modifier.size(40.dp))
                            Spacer(Modifier.height(8.dp))
                            Text(t.noQueue, color = SoilBrown, fontSize = 13.sp)
                        }
                    }
                }
            } else {
                items(state.globalQueue, key = { it.id }) { item ->
                    GlobalQueueItemRow(item = item, t = t, index = state.globalQueue.indexOf(item) + 1,
                        onPlay = { vm.markPlaying(item.id) },
                        onRemove = { vm.removeItem(item.id) })
                }
            }
        }
    }
}

@Composable
private fun SectionHeader(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String, tint: androidx.compose.ui.graphics.Color) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(16.dp))
        Text(
            text = title.uppercase(),
            color = tint,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp,
        )
    }
}

@Composable
private fun GlobalQueueItemRow(
    item: GlobalQueueItem,
    t: Strings,
    index: Int,
    onPlay: () -> Unit,
    onRemove: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkSurface, RoundedCornerShape(12.dp))
            .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
            .padding(10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text(
            text = "$index",
            color = IncaGold.copy(alpha = 0.6f),
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp,
            modifier = Modifier.width(24.dp)
        )

        // Cover
        Box(
            modifier = Modifier
                .size(40.dp)
                .background(DarkBase, RoundedCornerShape(8.dp))
                .border(1.dp, DarkBorder, RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center,
        ) {
            var imageFailed by remember(item.song.id) { mutableStateOf(false) }
            if (!imageFailed) {
                AsyncImage(model = coverUrlFor(item.song.id), contentDescription = null,
                    contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize(),
                    onError = { imageFailed = true })
            } else {
                Icon(Icons.Default.MusicNote, contentDescription = null, tint = SoilBrown, modifier = Modifier.size(18.dp))
            }
        }

        Column(modifier = Modifier.weight(1f)) {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(item.song.title, color = WarmWhite, fontWeight = FontWeight.Medium, fontSize = 13.sp,
                    maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f, fill = false))
                LanguageBadge(item.song.language)
            }
            Text(item.song.artist, color = SandBeige, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (item.requestedBy != null) Text("${t.by}: ${item.requestedBy}", color = SoilBrown, fontSize = 10.sp)
        }

        Column(horizontalAlignment = Alignment.End) {
            Text(
                text = "${t.tableLabel} ${item.tableNumber}",
                color = ChakraOcre,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                modifier = Modifier
                    .background(ChakraOcre.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            )
            Spacer(Modifier.height(2.dp))
            Text(timeAgo(item.createdAt), color = SoilBrown, fontSize = 10.sp)
        }

        Column {
            IconButton(onClick = onPlay, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.PlayArrow, contentDescription = null, tint = SelvaVerde, modifier = Modifier.size(18.dp))
            }
            IconButton(onClick = onRemove, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.Delete, contentDescription = null, tint = KichwaRojo.copy(alpha = 0.7f), modifier = Modifier.size(18.dp))
            }
        }
    }
}
