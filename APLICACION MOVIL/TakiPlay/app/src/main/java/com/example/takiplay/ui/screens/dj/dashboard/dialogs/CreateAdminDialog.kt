package com.example.takiplay.ui.screens.dj.dashboard.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.takiplay.data.model.CreateAdminDto
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Strings

@Composable
fun CreateAdminDialog(t: Strings, onConfirm: (CreateAdminDto) -> Unit, onDismiss: () -> Unit) {
    var name     by remember { mutableStateOf("") }
    var email    by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var error    by remember { mutableStateOf<String?>(null) }

    Dialog(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(DarkSurface, RoundedCornerShape(16.dp))
                .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(t.createAdmin, color = WarmWhite, fontWeight = FontWeight.Bold, fontSize = 17.sp)

            OutlinedTextField(
                value = name, onValueChange = { name = it; error = null },
                label = { Text("Nombre *", fontSize = 11.sp) },
                modifier = Modifier.fillMaxWidth(), singleLine = true,
                colors = textFieldColors(), shape = RoundedCornerShape(8.dp),
            )
            OutlinedTextField(
                value = email, onValueChange = { email = it; error = null },
                label = { Text("Email *", fontSize = 11.sp) },
                modifier = Modifier.fillMaxWidth(), singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                colors = textFieldColors(), shape = RoundedCornerShape(8.dp),
            )
            OutlinedTextField(
                value = password, onValueChange = { password = it; error = null },
                label = { Text("Contraseña *", fontSize = 11.sp) },
                modifier = Modifier.fillMaxWidth(), singleLine = true,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                            contentDescription = null, tint = SoilBrown)
                    }
                },
                colors = textFieldColors(), shape = RoundedCornerShape(8.dp),
            )

            if (error != null) Text(error!!, color = RojoSangay, fontSize = 12.sp)

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = onDismiss, modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = SandBeige),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder),
                    shape = RoundedCornerShape(8.dp),
                ) { Text(t.close) }

                Button(
                    onClick = {
                        if (name.isBlank() || email.isBlank() || password.isBlank()) {
                            error = "Todos los campos son requeridos"; return@Button
                        }
                        if (password.length < 6) { error = "La contraseña debe tener al menos 6 caracteres"; return@Button }
                        onConfirm(CreateAdminDto(name.trim(), email.trim(), password))
                    },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = IncaGold, contentColor = DarkBase),
                    shape = RoundedCornerShape(8.dp),
                ) { Text("Crear", fontWeight = FontWeight.Bold) }
            }
        }
    }
}
