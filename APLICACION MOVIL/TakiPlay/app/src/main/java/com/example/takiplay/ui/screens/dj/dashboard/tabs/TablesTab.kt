package com.example.takiplay.ui.screens.dj.dashboard.tabs

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.takiplay.data.model.Table
import com.example.takiplay.ui.components.StatusBadge
import com.example.takiplay.ui.screens.dj.dashboard.dialogs.AddTableDialog
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Strings

@Composable
fun TablesTab(t: Strings) {
    val vm: TablesTabViewModel = viewModel()
    val state by vm.state.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val context = LocalContext.current
    var showAdd by remember { mutableStateOf(false) }
    var deleteTable by remember { mutableStateOf<Table?>(null) }

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
            Row(
                modifier = Modifier.fillMaxWidth().padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("${t.tablesTitle} (${state.tables.size})",
                    color = WarmWhite, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Button(
                    onClick = { showAdd = true },
                    colors = ButtonDefaults.buttonColors(containerColor = IncaGold, contentColor = DarkBase),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(t.newTable, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }

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
                    items(state.tables, key = { it.id }) { table ->
                        TableRow(
                            table = table,
                            t = t,
                            onCopyQr = {
                                val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                cm.setPrimaryClip(ClipData.newPlainText("QR", table.qrCode))
                                vm.showSuccess(t.qrCopied)
                            },
                            onToggle = { vm.toggleActive(table) },
                            onDelete = { deleteTable = table },
                        )
                    }
                }
            }
        }
    }

    if (showAdd) {
        AddTableDialog(
            t = t,
            onConfirm = { number -> vm.createTable(number) { showAdd = false } },
            onDismiss = { showAdd = false },
        )
    }

    deleteTable?.let { table ->
        AlertDialog(
            onDismissRequest = { deleteTable = null },
            containerColor = DarkSurface,
            title = { Text("Eliminar mesa", color = WarmWhite) },
            text = { Text("¿Eliminar Mesa #${table.number}?", color = SandBeige) },
            confirmButton = {
                Button(onClick = { vm.deleteTable(table.id); deleteTable = null },
                    colors = ButtonDefaults.buttonColors(containerColor = KichwaRojo)) {
                    Text("Eliminar")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { deleteTable = null },
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = SandBeige),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)) {
                    Text(t.close)
                }
            }
        )
    }
}

@Composable
private fun TableRow(table: Table, t: Strings, onCopyQr: () -> Unit, onToggle: () -> Unit, onDelete: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkSurface, RoundedCornerShape(10.dp))
            .border(1.dp, DarkBorder, RoundedCornerShape(10.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text("${t.colTable} #${table.number}", color = WarmWhite, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
            Text(
                text = table.qrCode,
                color = SoilBrown,
                fontSize = 10.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            if ((table.pendingQueueCount ?: 0) > 0) {
                Text("${t.colQueue}: ${table.pendingQueueCount}", color = IncaGold, fontSize = 11.sp)
            }
        }
        StatusBadge(isActive = table.isActive, activeLabel = "Activa", inactiveLabel = "Inactiva")
        Row {
            IconButton(onClick = onCopyQr, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.ContentCopy, contentDescription = null, tint = CieloAndino, modifier = Modifier.size(16.dp))
            }
            IconButton(onClick = onToggle, modifier = Modifier.size(32.dp)) {
                Icon(
                    if (table.isActive) Icons.Default.ToggleOn else Icons.Default.ToggleOff,
                    contentDescription = null,
                    tint = if (table.isActive) VerdeKitu else SoilBrown,
                    modifier = Modifier.size(20.dp)
                )
            }
            IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.Delete, contentDescription = null, tint = KichwaRojo.copy(0.7f), modifier = Modifier.size(16.dp))
            }
        }
    }
}
