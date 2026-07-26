package com.example.takiplay.ui.navigation

import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.example.takiplay.TakiPlayApp
import com.example.takiplay.ui.screens.dj.dashboard.DJDashboardScreen
import com.example.takiplay.ui.screens.dj.forgotpassword.DJForgotPasswordScreen
import com.example.takiplay.ui.screens.dj.login.DJLoginScreen
import com.example.takiplay.ui.screens.home.HomeScreen
import com.example.takiplay.ui.screens.mesa.MesaScreen
import com.example.takiplay.ui.screens.tableselection.TableSelectionScreen
import com.example.takiplay.util.Translations

object Routes {
    const val HOME               = "home"
    const val TABLE_SELECTION    = "table_selection"
    const val MESA               = "mesa/{qrCode}"
    const val DJ_LOGIN           = "dj_login"
    const val DJ_FORGOT_PASSWORD = "dj_forgot_password"
    const val DJ_DASHBOARD       = "dj_dashboard"

    fun mesa(qrCode: String) = "mesa/$qrCode"
}

@Composable
fun TakiPlayNavGraph() {
    val navController = rememberNavController()
    val context = LocalContext.current
    val prefs = (context.applicationContext as TakiPlayApp).prefs
    val lang by prefs.language.collectAsState(initial = "es")

    NavHost(
        navController = navController,
        startDestination = Routes.HOME,
    ) {
        composable(Routes.HOME) {
            HomeScreen(
                lang = lang,
                onSetLang = { },
                onSelectTable = { navController.navigate(Routes.TABLE_SELECTION) },
                prefs = prefs,
            )
        }

        composable(Routes.TABLE_SELECTION) {
            TableSelectionScreen(
                lang = lang,
                onTableSelected = { qrCode ->
                    navController.navigate(Routes.mesa(qrCode)) {
                        popUpTo(Routes.TABLE_SELECTION) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() },
            )
        }

        composable(
            route = Routes.MESA,
            arguments = listOf(navArgument("qrCode") { type = NavType.StringType }),
        ) { backStack ->
            val qrCode = backStack.arguments?.getString("qrCode") ?: ""
            MesaScreen(
                qrCode = qrCode,
                lang = lang,
                prefs = prefs,
                onBack = { navController.popBackStack() },
            )
        }

        composable(Routes.DJ_LOGIN) {
            DJLoginScreen(
                lang = lang,
                prefs = prefs,
                onLoginSuccess = {
                    navController.navigate(Routes.DJ_DASHBOARD) {
                        popUpTo(Routes.DJ_LOGIN) { inclusive = true }
                    }
                },
                onForgotPassword = { navController.navigate(Routes.DJ_FORGOT_PASSWORD) },
                onBack = { navController.popBackStack() },
            )
        }

        composable(Routes.DJ_FORGOT_PASSWORD) {
            DJForgotPasswordScreen(
                t = Translations.get(lang),
                onBack = { navController.popBackStack() },
            )
        }

        composable(Routes.DJ_DASHBOARD) {
            DJDashboardScreen(
                lang = lang,
                prefs = prefs,
                onLogout = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(0) { inclusive = true }
                    }
                },
            )
        }
    }
}
