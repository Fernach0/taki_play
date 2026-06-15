package com.example.takiplay.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // DESARROLLO: usa localhost con "adb reverse tcp:3000 tcp:3000"
    // Dispositivo físico → cambia a http://192.168.X.X:3000/api/v1/
    // Producción → https://taki-play.onrender.com/api/v1/
    const val BASE_URL = "https://taki-play.onrender.com/api/v1/"

    private var token: String? = null

    fun setToken(t: String?) { token = t }
    fun getToken(): String? = token

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .addInterceptor { chain ->
            val builder = chain.request().newBuilder()
                .header("Content-Type", "application/json")
                .header("ngrok-skip-browser-warning", "true")
            token?.let { builder.header("Authorization", "Bearer $it") }
            chain.proceed(builder.build())
        }
        .addInterceptor(loggingInterceptor)
        .build()

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val auth: AuthApi       = retrofit.create(AuthApi::class.java)
    val songs: SongsApi     = retrofit.create(SongsApi::class.java)
    val queue: QueueApi     = retrofit.create(QueueApi::class.java)
    val tables: TablesApi   = retrofit.create(TablesApi::class.java)
    val sessions: SessionsApi = retrofit.create(SessionsApi::class.java)
}
