package com.example.takiplay.ui.screens.tableselection

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.TableRestaurant
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.takiplay.data.model.Table
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Translations

@Composable
fun TableSelectionScreen(
    lang: String,
    onTableSelected: (qrCode: String) -> Unit,
    onBack: () -> Unit,
) {
    val t = Translations.get(lang)
    val vm: TableSelectionViewModel = viewModel()
    val state by vm.state.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBase),
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DarkSurface)
                .padding(horizontal = 8.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Volver",
                        tint = WarmWhite,
                    )
                }
                Column {
                    Text(
                        text = "Taki Play",
                        color = WarmWhite,
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                    )
                    Text(
                        text = "Elige tu mesa",
                        color = IncaGold,
                        fontSize = 11.sp,
                    )
                }
            }
            IconButton(onClick = { vm.load() }) {
                Icon(Icons.Default.Refresh, contentDescription = "Recargar", tint = SoilBrown)
            }
        }

        // Subtitle
        Text(
            text = "¿En qué mesa estás sentado?",
            color = SandBeige,
            fontSize = 14.sp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 16.dp),
            textAlign = TextAlign.Center,
        )

        // Content
        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            when {
                state.isLoading -> {
                    CircularProgressIndicator(
                        color = IncaGold,
                        modifier = Modifier.align(Alignment.Center),
                    )
                }

                state.error != null -> {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                    ) {
                        Text(
                            text = state.error!!,
                            color = SandBeige,
                            textAlign = TextAlign.Center,
                            fontSize = 14.sp,
                        )
                        Button(
                            onClick = { vm.load() },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = IncaGold,
                                contentColor = DarkBase,
                            ),
                            shape = RoundedCornerShape(10.dp),
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Reintentar", fontWeight = FontWeight.Bold)
                        }
                    }
                }

                state.tables.isEmpty() -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Icon(
                            Icons.Default.TableRestaurant,
                            contentDescription = null,
                            tint = SoilBrown.copy(alpha = 0.4f),
                            modifier = Modifier.size(48.dp),
                        )
                        Spacer(Modifier.height(12.dp))
                        Text(
                            text = "No hay mesas disponibles",
                            color = SoilBrown,
                            fontSize = 14.sp,
                        )
                    }
                }

                else -> {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(3),
                        contentPadding = PaddingValues(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxSize(),
                    ) {
                        items(state.tables, key = { it.id }) { table ->
                            TableCard(table = table, onClick = { onTableSelected(table.qrCode) })
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TableCard(table: Table, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .aspectRatio(1f)
            .clip(RoundedCornerShape(16.dp))
            .background(DarkSurface)
            .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
            .clickable { onClick() }
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .background(IncaGold.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                .border(1.dp, IncaGold.copy(alpha = 0.3f), RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                Icons.Default.TableRestaurant,
                contentDescription = null,
                tint = IncaGold,
                modifier = Modifier.size(24.dp),
            )
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = "${table.number}",
            color = WarmWhite,
            fontWeight = FontWeight.Bold,
            fontSize = 22.sp,
        )
        Text(
            text = "Mesa",
            color = SoilBrown,
            fontSize = 10.sp,
        )
        // Pending queue indicator
        if ((table.pendingQueueCount ?: 0) > 0) {
            Spacer(Modifier.height(4.dp))
            Text(
                text = "♪ ${table.pendingQueueCount}",
                color = IncaGold,
                fontSize = 10.sp,
                fontWeight = FontWeight.Medium,
            )
        }
    }
}
