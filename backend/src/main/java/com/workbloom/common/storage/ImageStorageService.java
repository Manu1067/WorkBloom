package com.workbloom.common.storage;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.workbloom.exception.BadRequestException;

/**
 * Stores user-uploaded images on the local filesystem (no cloud key needed).
 *
 * Safety model:
 *  - the client's filename is NEVER used (a random UUID + an extension chosen
 *    by the server from the detected type), so path traversal / odd
 *    characters / double extensions are impossible;
 *  - the declared Content-Type must be JPEG, PNG or WebP;
 *  - the file's leading bytes ("magic numbers") must match that type, so a
 *    script or executable renamed to .png is rejected;
 *  - size is capped (default 5 MB) and empty files are rejected;
 *  - only a relative URL such as /uploads/impact/{uuid}.png is returned
 *    for storing in the database - never the image bytes.
 */
@Service
public class ImageStorageService {

    public static final long DEFAULT_MAX_BYTES = 5L * 1024 * 1024;

    /** Public URL prefix served by UploadResourceConfig. */
    public static final String URL_PREFIX = "/uploads/";

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp");

    private static final Pattern SAFE_FOLDER = Pattern.compile("^[a-z0-9-]{1,40}$");
    private static final Pattern STORED_URL = Pattern.compile(
            "^/uploads/([a-z0-9-]{1,40})/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|png|webp)$");

    private final Path rootDirectory;
    private final long maxBytes;

    public ImageStorageService(
            @Value("${workbloom.upload.dir:uploads}") String uploadDir,
            @Value("${workbloom.upload.max-image-bytes:5242880}") long maxBytes) {
        this.rootDirectory = Path.of(uploadDir).toAbsolutePath().normalize();
        this.maxBytes = maxBytes > 0 ? maxBytes : DEFAULT_MAX_BYTES;
    }

    public Path getRootDirectory() {
        return rootDirectory;
    }

    public long getMaxBytes() {
        return maxBytes;
    }

    /**
     * Validates and stores the image under {root}/{folder}/ and returns its
     * relative public URL.
     *
     * @throws BadRequestException (HTTP 400) with a user-readable message
     */
    public String storeImage(MultipartFile file, String folder) {

        if (folder == null || !SAFE_FOLDER.matcher(folder).matches()) {
            throw new IllegalArgumentException("Invalid upload folder");
        }
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please choose an image to upload.");
        }
        if (file.getSize() > maxBytes) {
            String limit = maxBytes >= 1024 * 1024
                    ? (maxBytes / (1024 * 1024)) + " MB"
                    : Math.max(1, maxBytes / 1024) + " KB";
            throw new BadRequestException("Image is too large. The maximum size is " + limit + ".");
        }

        String contentType = file.getContentType() == null
                ? ""
                : file.getContentType().toLowerCase(Locale.ROOT).trim();
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException("Only JPEG, PNG or WebP images are allowed.");
        }

        byte[] head;
        try (InputStream in = file.getInputStream()) {
            head = in.readNBytes(12);
        } catch (IOException ex) {
            throw new BadRequestException("The uploaded image could not be read.");
        }
        if (!matchesSignature(contentType, head)) {
            throw new BadRequestException(
                    "The file content does not match a valid " + contentType.substring(6).toUpperCase(Locale.ROOT) + " image.");
        }

        String filename = UUID.randomUUID() + "." + EXTENSIONS.get(contentType);
        Path folderPath = rootDirectory.resolve(folder).normalize();
        Path target = folderPath.resolve(filename).normalize();
        if (!target.startsWith(rootDirectory)) {
            throw new BadRequestException("Invalid upload path.");
        }

        try {
            Files.createDirectories(folderPath);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Could not store the uploaded image.", ex);
        }

        return URL_PREFIX + folder + "/" + filename;
    }

    /**
     * True only for URLs this service could have produced. Used to reject
     * arbitrary/external strings (e.g. javascript: URLs or ../ tricks) when a
     * client submits an imageUrl with a create request.
     */
    public static boolean isStoredImageUrl(String url) {
        return url != null && STORED_URL.matcher(url).matches();
    }

    static boolean matchesSignature(String contentType, byte[] b) {
        if (b == null) {
            return false;
        }
        switch (contentType) {
            case "image/jpeg":
                return b.length >= 3
                        && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF;
            case "image/png":
                return b.length >= 8
                        && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G'
                        && b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A;
            case "image/webp":
                return b.length >= 12
                        && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                        && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
            default:
                return false;
        }
    }
}
