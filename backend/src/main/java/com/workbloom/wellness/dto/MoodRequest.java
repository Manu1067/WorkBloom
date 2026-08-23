package com.workbloom.wellness.dto;

public class MoodRequest {

    private String mood;

    private String note;

    public MoodRequest() {
    }

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}