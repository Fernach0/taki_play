package com.example.takiplay.ui.screens.qrscanner

import android.Manifest
import android.util.Size
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import com.google.accompanist.permissions.shouldShowRationale
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Translations
import java.util.concurrent.Executors

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun QrScannerScreen(
    lang: String,
    onQrScanned: (String) -> Unit,
    onBack: () -> Unit,
) {
    val t = Translations.get(lang)
    val cameraPermission = rememberPermissionState(Manifest.permission.CAMERA)

    LaunchedEffect(Unit) {
        if (!cameraPermission.status.isGranted) cameraPermission.launchPermissionRequest()
    }

    Box(modifier = Modifier.fillMaxSize().background(DarkBase)) {
        when {
            cameraPermission.status.isGranted -> {
                CameraPreviewWithQr(onQrScanned = onQrScanned)
            }
            cameraPermission.status.shouldShowRationale -> {
                PermissionRationale(
                    message = "La cámara es necesaria para escanear el código QR de tu mesa.",
                    onRequest = { cameraPermission.launchPermissionRequest() }
                )
            }
            else -> {
                PermissionRationale(
                    message = "Permiso de cámara requerido. Actívalo en Ajustes.",
                    onRequest = { cameraPermission.launchPermissionRequest() }
                )
            }
        }

        // Top bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.TopStart)
                .background(DarkBase.copy(alpha = 0.7f))
                .padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = WarmWhite)
            }
            Text(
                text = t.homeQrTitle,
                color = WarmWhite,
                fontWeight = FontWeight.SemiBold,
                fontSize = 16.sp,
            )
        }

        // Viewfinder overlay
        if (cameraPermission.status.isGranted) {
            Box(
                modifier = Modifier
                    .size(240.dp)
                    .align(Alignment.Center)
                    .border(3.dp, IncaGold, RoundedCornerShape(16.dp))
            )
            Text(
                text = "Apunta al código QR de tu mesa",
                color = WarmWhite,
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 80.dp)
                    .background(DarkBase.copy(alpha = 0.6f), RoundedCornerShape(8.dp))
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            )
        }
    }
}

@Composable
private fun CameraPreviewWithQr(onQrScanned: (String) -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val executor = remember { Executors.newSingleThreadExecutor() }
    var scanned by remember { mutableStateOf(false) }

    val previewView = remember { PreviewView(context) }

    DisposableEffect(Unit) {
        onDispose { executor.shutdown() }
    }

    LaunchedEffect(Unit) {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(previewView.surfaceProvider)
            }

            val options = BarcodeScannerOptions.Builder()
                .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                .build()
            val scanner = BarcodeScanning.getClient(options)

            val analysis = ImageAnalysis.Builder()
                .setTargetResolution(Size(1280, 720))
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()

            @androidx.camera.core.ExperimentalGetImage
            analysis.setAnalyzer(executor) { imageProxy ->
                if (scanned) { imageProxy.close(); return@setAnalyzer }
                val mediaImage = imageProxy.image
                if (mediaImage != null) {
                    val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
                    scanner.process(image)
                        .addOnSuccessListener { barcodes ->
                            barcodes.firstOrNull()?.rawValue?.let { value ->
                                if (!scanned) {
                                    scanned = true
                                    val qrCode = extractQrCode(value)
                                    onQrScanned(qrCode)
                                }
                            }
                        }
                        .addOnCompleteListener { imageProxy.close() }
                } else {
                    imageProxy.close()
                }
            }

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    CameraSelector.DEFAULT_BACK_CAMERA,
                    preview,
                    analysis,
                )
            } catch (_: Exception) {}
        }, ContextCompat.getMainExecutor(context))
    }

    AndroidView(
        factory = { previewView },
        modifier = Modifier.fillMaxSize(),
    )
}

// Extract just the qrCode segment from full URLs like http://host/mesa/ABC123
private fun extractQrCode(raw: String): String {
    return if (raw.contains("/mesa/")) {
        raw.substringAfterLast("/mesa/").trim('/')
    } else {
        raw.trim()
    }
}

@Composable
private fun PermissionRationale(message: String, onRequest: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(text = message, color = SandBeige, textAlign = TextAlign.Center, fontSize = 14.sp)
        Spacer(Modifier.height(24.dp))
        Button(
            onClick = onRequest,
            colors = ButtonDefaults.buttonColors(containerColor = IncaGold, contentColor = DarkBase),
        ) {
            Text("Permitir cámara", fontWeight = FontWeight.Bold)
        }
    }
}
