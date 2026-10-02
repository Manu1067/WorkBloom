package com.workbloom.common.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import com.workbloom.exception.BadRequestException;

class ImageStorageServiceTest {

    private static final byte[] PNG = {
            (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D, 'I', 'H', 'D', 'R'};
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0x10, 'J', 'F', 'I', 'F'};
    private static final byte[] WEBP = {'R', 'I', 'F', 'F', 1, 2, 3, 4, 'W', 'E', 'B', 'P', 'V', 'P', '8', ' '};

    @TempDir
    Path dir;

    private ImageStorageService service;

    @BeforeEach
    void setUp() {
        service = new ImageStorageService(dir.toString(), 1024);
    }

    @Test
    void storesPngUnderRandomNameAndReturnsRelativeUrl() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "../../evil name.png", "image/png", PNG);

        String url = service.storeImage(file, "impact");

        assertThat(ImageStorageService.isStoredImageUrl(url)).isTrue();
        assertThat(url).startsWith("/uploads/impact/").endsWith(".png").doesNotContain("evil").doesNotContain("..");
        Path stored = dir.resolve(url.substring("/uploads/".length()));
        assertThat(stored).exists();
        assertThat(Files.readAllBytes(stored)).isEqualTo(PNG);
    }

    @Test
    void acceptsJpegAndWebp() {
        assertThat(service.storeImage(new MockMultipartFile("file", "a.jpg", "image/jpeg", JPEG), "impact"))
                .endsWith(".jpg");
        assertThat(service.storeImage(new MockMultipartFile("file", "a.webp", "image/webp", WEBP), "impact"))
                .endsWith(".webp");
    }

    @Test
    void rejectsDisallowedContentType() {
        MockMultipartFile file = new MockMultipartFile("file", "a.png", "image/svg+xml", PNG);

        assertThatThrownBy(() -> service.storeImage(file, "impact"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("JPEG, PNG or WebP");
    }

    @Test
    void rejectsExecutableRenamedAsPng() {
        byte[] exe = {'M', 'Z', (byte) 0x90, 0, 3, 0, 0, 0, 4, 0, 0, 0};
        MockMultipartFile file = new MockMultipartFile("file", "run.png", "image/png", exe);

        assertThatThrownBy(() -> service.storeImage(file, "impact"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("does not match");
    }

    @Test
    void rejectsOversizedAndEmptyFiles() {
        byte[] big = new byte[2048];
        System.arraycopy(PNG, 0, big, 0, PNG.length);

        assertThatThrownBy(() -> service.storeImage(new MockMultipartFile("file", "big.png", "image/png", big), "impact"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("too large");
        assertThatThrownBy(() -> service.storeImage(new MockMultipartFile("file", "e.png", "image/png", new byte[0]), "impact"))
                .isInstanceOf(BadRequestException.class);
        assertThatThrownBy(() -> service.storeImage(null, "impact"))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void rejectsUnsafeFolderNames() {
        MockMultipartFile file = new MockMultipartFile("file", "a.png", "image/png", PNG);

        assertThatThrownBy(() -> service.storeImage(file, "../etc"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void onlyAcceptsUrlsIssuedByTheService() {
        assertThat(ImageStorageService.isStoredImageUrl(
                "/uploads/impact/0b6f1c5e-1d2a-4c3b-9e8f-112233445566.png")).isTrue();
        assertThat(ImageStorageService.isStoredImageUrl("https://evil.example/x.png")).isFalse();
        assertThat(ImageStorageService.isStoredImageUrl("javascript:alert(1)")).isFalse();
        assertThat(ImageStorageService.isStoredImageUrl("/uploads/impact/../../etc/passwd")).isFalse();
        assertThat(ImageStorageService.isStoredImageUrl("/uploads/impact/file.php")).isFalse();
        assertThat(ImageStorageService.isStoredImageUrl(null)).isFalse();
    }
}
