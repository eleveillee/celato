import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useWebSocket } from "./src/hooks/useWebSocket";
import { ErrorBoundary } from "./src/components/ErrorBoundary";

// WebSocket URL configuration
// For iOS Simulator:      ws://localhost:4000/ws
// For Android Emulator:   ws://10.0.2.2:4000/ws
// For Physical Device:    ws://YOUR_COMPUTER_IP:4000/ws
// See .env.example for more details
const WS_URL = "ws://localhost:4000/ws";

function AppContent() {
	const { status, send, lastMessage, reconnect } = useWebSocket(WS_URL);

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "#22c55e";
      case "connecting":
        return "#eab308";
      case "error":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const handleSendTest = () => {
    send("test message from mobile");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Celato</Text>
      <Text style={styles.subtitle}>The Bionic Director</Text>

      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{status}</Text>
      </View>

			{status === "connected" && (
				<TouchableOpacity style={styles.button} onPress={handleSendTest}>
					<Text style={styles.buttonText}>Send Test Message</Text>
				</TouchableOpacity>
			)}

			{(status === "error" || status === "disconnected") && (
				<TouchableOpacity style={styles.retryButton} onPress={reconnect}>
					<Text style={styles.buttonText}>Retry Connection</Text>
				</TouchableOpacity>
			)}

      {lastMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Last Message:</Text>
          <Text style={styles.messageText}>{lastMessage}</Text>
        </View>
      )}

			<StatusBar style="auto" />
		</View>
	);
}

export default function App() {
	return (
		<ErrorBoundary>
			<AppContent />
		</ErrorBoundary>
	);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
	button: {
		backgroundColor: "#3b82f6",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
		marginBottom: 24,
	},
	retryButton: {
		backgroundColor: "#f59e0b",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
		marginBottom: 24,
	},
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  messageContainer: {
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 8,
    width: "100%",
  },
  messageLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#111827",
    fontFamily: "monospace",
  },
});
