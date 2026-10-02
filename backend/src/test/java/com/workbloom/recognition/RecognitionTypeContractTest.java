package com.workbloom.recognition;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.workbloom.recognition.dto.RecognitionRequest;
import com.workbloom.recognition.entity.RecognitionType;

/**
 * Pins the wire contract the Appreciation form relies on: the backend enum only
 * accepts these five values, so the UI maps each friendly category onto one of
 * them (RecognitionView.jsx RECOGNITION_TYPES.apiType).
 */
class RecognitionTypeContractTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void acceptedEnumValuesAreExactlyTheFiveTheUiMapsTo() {
        assertThat(RecognitionType.values()).extracting(Enum::name)
                .containsExactlyInAnyOrder("ACHIEVEMENT", "RECOGNITION", "BEST_PERFORMER", "MILESTONE", "CERTIFICATION");
    }

    @Test
    void requestWithAValidTypeDeserializes() throws Exception {
        RecognitionRequest request = mapper.readValue(
                "{\"employeeId\":7,\"title\":\"Thanks\",\"message\":\"Great help\",\"type\":\"RECOGNITION\"}",
                RecognitionRequest.class);

        assertThat(request.getType()).isEqualTo(RecognitionType.RECOGNITION);
        assertThat(request.getEmployeeId()).isEqualTo(7L);
    }

    @Test
    void theOldUiValueTeamworkIsRejected() {
        assertThatThrownBy(() -> mapper.readValue(
                "{\"employeeId\":7,\"title\":\"Thanks\",\"message\":\"x\",\"type\":\"TEAMWORK\"}",
                RecognitionRequest.class))
                .isInstanceOf(InvalidFormatException.class);
    }
}
