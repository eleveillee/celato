import React, { Component, type ReactNode } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { logger } from "../utils/logger";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		logger.error("ErrorBoundary caught an error", {
			error: error.message,
			stack: error.stack,
			componentStack: errorInfo.componentStack,
		});
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			return (
				<View style={styles.container}>
					<Text style={styles.title}>Something went wrong</Text>
					<Text style={styles.message}>
						{this.state.error?.message || "An unexpected error occurred"}
					</Text>
					<TouchableOpacity style={styles.button} onPress={this.handleReset}>
						<Text style={styles.buttonText}>Try Again</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return this.props.children;
	}
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
		fontSize: 24,
		fontWeight: "bold",
		color: "#ef4444",
		marginBottom: 16,
	},
	message: {
		fontSize: 14,
		color: "#6b7280",
		textAlign: "center",
		marginBottom: 32,
		fontFamily: "monospace",
	},
	button: {
		backgroundColor: "#3b82f6",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
