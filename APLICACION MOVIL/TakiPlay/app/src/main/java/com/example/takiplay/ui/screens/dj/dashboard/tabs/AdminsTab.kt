package com.example.takiplay.ui.screens.dj.dashboard.tabs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.takiplay.data.model.Admin
import com.example.takiplay.data.model.CreateAdminDto
import com.example.takiplay.ui.screens.dj.dashboard.dialogs.CreateAdminDialog
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Strings

@Composable
fun AdminsTab(t: Strings) {
    val vm: AdminsTabViewModel = viewModel()
    val state by vm.state.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    var showCreate by remember { mutableStateOf(false) }
    var deleteAdmin by remember { mutableStateOf<Admin?>(null) }

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
                Text("${t.adminsTitle} (${state.admins.size})",
                    color = WarmWhite, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Button(
                    onClick = { showCreate = true },
                    colors = ButtonDefaults.buttonColors(containerColor = IncaGold, contentColor = DarkBase),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                ) {
                    Icon(Icons.Default.PersonAdd, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(t.createAdmin, fontSize = 13.sp, fontWeight = FontWeight.Bold)
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
                    items(state.admins, key = { it.id }) { admin ->
                        AdminRow(admin = admin, onDelete = { deleteAdmin = admin })
                    }
                }
            }
        }
    }

    if (showCreate) {
        CreateAdminDialog(
            t = t,
            onConfirm = { dto -> vm.createAdmin(dto) { showCreate = false } },
            onDismiss = { showCreate = false },
        )
    }

    deleteAdmin?.let { admin ->
        AlertDialog(
            onDismissRequest = { deleteAdmin = null },
            containerColor = DarkSurface,
            title = { Text("Eliminar administrador", color = WarmWhite) },
            text = { Text("¿Eliminar a \"${admin.name}\"?", color = SandBeige) },
            confirmButton = {
                Button(onClick = { vm.deleteAdmin(admin.id); deleteAdmin = null },
                    colors = ButtonDefaults.buttonColors(containerColor = KichwaRojo)) {
                    Text("Eliminar")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { deleteAdmin = null },
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = SandBeige),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)) {
                    Text(t.close)
                }
            }
        )
    }
}

@Composable
private fun AdminRow(admin: Admin, onDelete: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkSurface, RoundedCornerShape(10.dp))
            .border(1.dp, DarkBorder, RoundedCornerShape(10.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        // Avatar
        Box(
            modifier = Modifier
                .size(40.dp)
                .background(IncaGold.copy(alpha = 0.15f), CircleShape)
                .border(1.dp, IncaGold.copy(alpha = 0.3f), CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text  = admin.name.first().uppercase(),
                color = IncaGold,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
            )
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(admin.name, color = WarmWhite, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
            Text(admin.email, color = SoilBrown, fontSize = 12.sp)
        }
        IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
            Icon(Icons.Default.PersonRemove, contentDescription = null,
                tint = KichwaRojo.copy(0.7f), modifier = Modifier.size(18.dp))
        }
    }
}
