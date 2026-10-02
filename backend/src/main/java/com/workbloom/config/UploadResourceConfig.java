package com.workbloom.config;

import java.nio.file.Path;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.TimeUnit;

import com.workbloom.common.storage.ImageStorageService;

/**
 * Serves stored uploads (e.g. Impact activity photos) read-only from the
 * configured upload directory at /uploads/**. Only files inside that
 * directory can be reached; Spring's resource handler rejects ../ traversal.
 */
@Configuration
public class UploadResourceConfig implements WebMvcConfigurer {

    private final ImageStorageService imageStorageService;

    public UploadResourceConfig(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path root = imageStorageService.getRootDirectory();
        String location = root.toUri().toString();
        if (!location.endsWith("/")) {
            location = location + "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location)
                .setCacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic());
    }
}
