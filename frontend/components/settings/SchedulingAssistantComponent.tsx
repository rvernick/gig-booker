import React, { useState } from "react";
import { Platform } from "react-native";
import { BaseScrollLayout } from "../layouts/base-scroll-layout";
import { VStack } from "../ui/vstack";
import { Input, InputField } from "../ui/input";
import { Button, ButtonText } from "../ui/button";
import { Text } from "../ui/text";
import { Heading } from "../ui/heading";
import { Spinner } from "../ui/spinner";
import { Box } from "../ui/box";
import { Pressable } from "../ui/pressable";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import Constants from "expo-constants";

export const SchedulingAssistantComponent = () => {
  const [clubName, setClubName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [alternateDates, setAlternateDates] = useState("");
  const [callResult, setCallResult] = useState("");
  const [isCalling, setIsCalling] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android, the picker closes itself. On iOS, it usually stays visible.
    setShowDatePicker(Platform.OS === "ios");

    if (selectedDate) {
      setDate(selectedDate);
      setProposedDate(
        selectedDate.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
      );
    }
  };

  const handleScheduleCall = async () => {
    if (!clubName || !name || !phone || !proposedDate) {
      setCallResult("Error: Please provide club name, contact name, phone number, and a proposed date.");
      return;
    }

    setIsCalling(true);
    setCallResult(`Triggering Eleven Labs agent to call ${name} for ${clubName}...`);

    try {
      // Using the Eleven Labs API to initiate the booking call.
      const agentId = Constants?.expoConfig?.extra?.ELEVEN_LABS_BOOKING_AGENT_ID;
      const apiKey = Constants?.expoConfig?.extra?.EXPO_PUBLIC_ELEVEN_LABS_API_KEY;

      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}/call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey || "",
        },
        body: JSON.stringify({
          phone_number: phone,
          dynamic_variables: {
            club_name: clubName,
            person_name: name,
            proposed_date: proposedDate,
            alternate_dates: alternateDates,
          },
        }),
      });

      const result = await response.json();
      setCallResult(`Eleven Labs call initiated (ID: ${result.call_id}). The agent is now calling ${name} to schedule ${proposedDate} for ${clubName}.`);
    } catch (error: any) {
      setCallResult(`Failed to initiate call: ${error.message}`);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <BaseScrollLayout>
      <VStack className="max-w-[440px] w-full mx-auto" space="xl">
        <VStack space="xs">
          <Heading size="lg">Scheduling Assistant</Heading>
          <Text size="sm" className="text-typography-500">
            Our AI agent will call this contact to negotiate the schedule.
          </Text>
        </VStack>

        <VStack space="md">
          <VStack space="xs">
            <Text size="sm" className="font-medium">Club Name</Text>
            <Input variant="outline">
              <InputField
                value={clubName}
                onChangeText={setClubName}
                placeholder="e.g. Sunny Tennis Club"
                testID="club-name-input"
              />
            </Input>
          </VStack>

          <VStack space="xs">
            <Text size="sm" className="font-medium">Contact Name</Text>
            <Input variant="outline">
              <InputField
                value={name}
                onChangeText={setName}
                placeholder="Who should we call?"
                testID="contact-name-input"
              />
            </Input>
          </VStack>

          <VStack space="xs">
            <Text size="sm" className="font-medium">Phone Number</Text>
            <Input variant="outline">
              <InputField
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. +1 555-0123"
                keyboardType="phone-pad"
              />
            </Input>
          </VStack>

          <VStack space="xs">
            <Text size="sm" className="font-medium">Proposed Date & Time</Text>
            <Pressable onPress={() => setShowDatePicker(true)}>
              <Input variant="outline">
                <InputField
                  value={proposedDate}
                  placeholder="Tap to select a date"
                  editable={false}
                />
              </Input>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="default"
                onChange={onDateChange}
              />
            )}
          </VStack>

          <VStack space="xs">
            <Text size="sm" className="font-medium">Alternate Dates</Text>
            <Input variant="outline">
              <InputField
                value={alternateDates}
                onChangeText={setAlternateDates}
                placeholder="e.g. Sat 10am, Sun 4pm"
              />
            </Input>
          </VStack>
        </VStack>

        <Button onPress={handleScheduleCall} isDisabled={isCalling} className="w-full">
          {isCalling ? <Spinner color="white" /> : <ButtonText>Schedule via AI Call</ButtonText>}
        </Button>

        {callResult ? (
          <Box className="mt-4 p-4 rounded-lg bg-background-50 border border-outline-100">
            <Text size="sm" className="font-bold mb-1">Status:</Text>
            <Text size="sm">{callResult}</Text>
          </Box>
        ) : null}
      </VStack>
    </BaseScrollLayout>
  );
};