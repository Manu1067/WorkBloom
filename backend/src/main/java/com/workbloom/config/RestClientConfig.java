package com.workbloom.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * RestClient used for outbound calls to the n8n + Ollama AI pipeline
 * (and any other external HTTP integration). Timeouts are externalized
 * so a slow/unreachable n8n instance fails fast with a clear error
 * instead of hanging the request thread indefinitely.
 */
@Configuration
public class RestClientConfig {

    @Bean
    public RestClient.Builder restClientBuilder(
            @Value("${workbloom.http-client.connect-timeout-ms:5000}") int connectTimeoutMs,
            @Value("${workbloom.http-client.read-timeout-ms:30000}") int readTimeoutMs) {

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(connectTimeoutMs);
        requestFactory.setReadTimeout(readTimeoutMs);

        return RestClient.builder()
                .requestFactory(requestFactory);
    }
}
