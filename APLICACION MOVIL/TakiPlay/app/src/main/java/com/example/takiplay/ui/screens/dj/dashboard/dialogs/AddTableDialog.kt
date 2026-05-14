package com.example.takiplay.ui.screens.dj.dashboard.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Strings

@Composable
fun AddTableDialog(t: Strings, onConfirm: (Int) -> Unit, onDismiss: () -> Unit) {
    var number by remember { mutableStateOf("") }
    var error  by remember { mutableStateOf<String?>(null) }

    Dialog(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(DarkSurface, RoundedCornerShape(16.dp))
                .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Text(t.newTable, color = WarmWhite, fontWeight = FontWeight.Bold, fontSize = 17.sp)

            OutlinedTextField(
                value = number,
                onValueChange = { number = it; error = null },
                label = { Text("Número de mesa *", fontSize = 11.sp) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                colors = textFieldColors(),
                shape = RoundedCornerShape(8.dp),
            )

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
                        val n = number.toIntOrNull()
                        if (n == null || n <= 0) { error = "Ingresa un número de mesa válido"; return@Button }
                        onConfirm(n)
                    },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = IncaGold, contentColor = DarkBase),
                    shape = RoundedCornerShape(8.dp),
                ) { Text("Crear", fontWeight = FontWeight.Bold) }
            }
        }
    }
}
