# Project Celato: Implementation Roadmap

## Phase 1: The "Wizard of Oz" Prototype (Week 1-2)
**Goal**: Validate the "Whisper" interaction model without building the full mobile app.

*   **Tech**: Web Interface (Next.js) + Retell AI Web Client.
*   **Features**:
    *   Simple web dialer.
    *   "Whisper" button (Spacebar) that sends text messages to the running Agent context.
    *   Visual log of the conversation.
*   **Test**: Call a real business (e.g., check store hours) and try to direct the agent mid-call.

## Phase 2: The "Bionic Director" MVP (Week 3-6)
**Goal**: First functional mobile experience.

*   **Tech**: React Native (Expo) App + Node.js Backend.
*   **Features**:
    *   **VoIP Integration**: Full audio stack.
    *   **Whisper Audio**: Real-time audio injection (not just text).
    *   **Live Transcript**: Streaming text of the conversation.
    *   **Basic Contexts**: "General", "Restaurant Booking", "Support Call".
*   **Success Metric**: Successful dinner reservation in a foreign language (e.g., Italian) where the user corrects a detail mid-call.

## Phase 3: "Smart Cost" & Polish (Week 7-10)
**Goal**: Make it viable for daily use.

*   **Features**:
    *   **Model Switching**: Implement the "Parrot" (Cheap) vs. "Negotiator" (Smart) tiering.
    *   **Contacts Integration**: Import phone contacts.
    *   **Call History**: Playback and transcript review.
    *   **Localization**: UI in English, Agent fluent in IT/ES/FR/DE/JP.

## Future Considerations
*   **Local Mode**: "Face-to-Face" translation tool (competing with Google Translate but with Agency).
*   **Enterprise API**: Letting businesses use Celato agents for their own outbound calls (reversed role).
