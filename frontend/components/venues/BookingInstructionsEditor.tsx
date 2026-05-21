import React, { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { Dropdown } from "@/components/common/Dropdown";
import { useSession } from "@/common/ctx";
import { ensureString } from "@/common/utils";
import {
  fetchVenueBookingInstructions,
  upsertVenueBookingInstructions,
} from "@/common/data-utils";
import type {
  BookingMethodType,
  VenueBookingInstructions,
} from "@/models/VenueBookingInstructions";

type Props = {
  venueId: number;
};

const methodOptions = [
  { label: "Phone", value: "phone" },
  { label: "Email", value: "email" },
  { label: "Web form", value: "web_form" },
  { label: "Snail mail", value: "snail_mail" },
];

const emptyInstructions = (venueId: number): VenueBookingInstructions => ({
  venueId,
  type: "phone",
  generalNotes: null,
  notes: null,
  bodyTemplate: null,
  phoneNumber: null,
  contactName: null,
  bestTimeToCall: null,
  emailAddress: null,
  subjectTemplate: null,
  url: null,
  streetAddress: null,
  city: null,
  state: null,
  postalCode: null,
  country: "US",
});

export function BookingInstructionsEditor({ venueId }: Props) {
  const session = useSession();
  const username = ensureString(session.username);

  const [instructions, setInstructions] = useState<VenueBookingInstructions>(
    emptyInstructions(venueId),
  );
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (venueId <= 0) return;
    let cancelled = false;

    const load = async () => {
      setIsFetching(true);
      setErrorMessage(null);
      try {
        const result = await fetchVenueBookingInstructions(session, username, venueId);
        if (cancelled) return;
        if (result) setInstructions(result);
        else setInstructions(emptyInstructions(venueId));
      } catch {
        if (!cancelled) setErrorMessage("Failed to load booking instructions.");
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [venueId]);

  const set = <K extends keyof VenueBookingInstructions>(
    key: K,
    value: VenueBookingInstructions[K],
  ) => setInstructions((prev) => ({ ...prev, [key]: value }));

  const handleTypeChange = (value: string) => {
    setInstructions((prev) => ({ ...prev, type: value as BookingMethodType }));
  };

  const onSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const saved = await upsertVenueBookingInstructions(session, username, instructions);
      if (!saved) {
        setErrorMessage("Save failed.");
        return;
      }
      setInstructions(saved);
      setSuccessMessage("Booking instructions saved.");
    } catch {
      setErrorMessage("Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  console.log("venueId: ", venueId);
  if (venueId <= 0) return null;

  return (
    <VStack className="gap-4 w-full pt-2">
      <Heading size="md">Booking Instructions</Heading>

      {isFetching && (
        <Box className="py-2">
          <Spinner size="small" />
        </Box>
      )}

      {errorMessage && (
        <Box className="bg-error-50 p-3 rounded-md">
          <Text className="text-error-700">{errorMessage}</Text>
        </Box>
      )}

      {successMessage && (
        <Box className="bg-success-50 p-3 rounded-md">
          <Text className="text-success-700">{successMessage}</Text>
        </Box>
      )}

      <VStack className="gap-2">
        <Text className="text-typography-700">Booking method</Text>
        <Dropdown
          value={instructions.type}
          disabled={isSaving}
          onSelect={handleTypeChange}
          options={methodOptions}
          initialLabel="Choose method..."
          testID="booking-method-type"
        />
      </VStack>

      {instructions.type === "phone" && (
        <>
          <VStack className="gap-2">
            <Text className="text-typography-700">Phone number</Text>
            <Input>
              <InputField
                value={instructions.phoneNumber ?? ""}
                placeholder="+1 555-000-0000"
                onChangeText={(v) => set("phoneNumber", v)}
                keyboardType="phone-pad"
                editable={!isSaving}
              />
            </Input>
          </VStack>
          <VStack className="gap-2">
            <Text className="text-typography-700">Contact name</Text>
            <Input>
              <InputField
                value={instructions.contactName ?? ""}
                placeholder="Booking manager"
                onChangeText={(v) => set("contactName", v)}
                editable={!isSaving}
              />
            </Input>
          </VStack>
          <VStack className="gap-2">
            <Text className="text-typography-700">Best time to call</Text>
            <Input>
              <InputField
                value={instructions.bestTimeToCall ?? ""}
                placeholder="Weekdays 10am–4pm"
                onChangeText={(v) => set("bestTimeToCall", v)}
                editable={!isSaving}
              />
            </Input>
          </VStack>
        </>
      )}

      {instructions.type === "email" && (
        <>
          <VStack className="gap-2">
            <Text className="text-typography-700">Email address</Text>
            <Input>
              <InputField
                value={instructions.emailAddress ?? ""}
                placeholder="booking@venue.com"
                onChangeText={(v) => set("emailAddress", v)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSaving}
              />
            </Input>
          </VStack>
          <VStack className="gap-2">
            <Text className="text-typography-700">Contact name</Text>
            <Input>
              <InputField
                value={instructions.contactName ?? ""}
                placeholder="Booking manager"
                onChangeText={(v) => set("contactName", v)}
                editable={!isSaving}
              />
            </Input>
          </VStack>
          <VStack className="gap-2">
            <Text className="text-typography-700">Subject template</Text>
            <Input>
              <InputField
                value={instructions.subjectTemplate ?? ""}
                placeholder="Booking inquiry – [Band name]"
                onChangeText={(v) => set("subjectTemplate", v)}
                editable={!isSaving}
              />
            </Input>
          </VStack>
        </>
      )}

      {instructions.type === "web_form" && (
        <VStack className="gap-2">
          <Text className="text-typography-700">Form URL</Text>
          <Input>
            <InputField
              value={instructions.url ?? ""}
              placeholder="https://venue.com/book"
              onChangeText={(v) => set("url", v)}
              autoCapitalize="none"
              editable={!isSaving}
            />
          </Input>
        </VStack>
      )}

      {instructions.type === "snail_mail" && (
        <>
          <VStack className="gap-2">
            <Text className="text-typography-700">Contact name</Text>
            <Input>
              <InputField
                value={instructions.contactName ?? ""}
                placeholder="Booking manager"
                onChangeText={(v) => set("contactName", v)}
                editable={!isSaving}
              />
            </Input>
          </VStack>
          <VStack className="gap-2">
            <Text className="text-typography-700">Street address</Text>
            <Input>
              <InputField
                value={instructions.streetAddress ?? ""}
                placeholder="123 Main St"
                onChangeText={(v) => set("streetAddress", v)}
                editable={!isSaving}
              />
            </Input>
          </VStack>
          <HStack className="gap-2">
            <VStack className="gap-2 flex-1">
              <Text className="text-typography-700">City</Text>
              <Input>
                <InputField
                  value={instructions.city ?? ""}
                  placeholder="City"
                  onChangeText={(v) => set("city", v)}
                  editable={!isSaving}
                />
              </Input>
            </VStack>
            <VStack className="gap-2 w-24">
              <Text className="text-typography-700">State</Text>
              <Input>
                <InputField
                  value={instructions.state ?? ""}
                  placeholder="CA"
                  onChangeText={(v) => set("state", v)}
                  autoCapitalize="characters"
                  editable={!isSaving}
                />
              </Input>
            </VStack>
          </HStack>
          <HStack className="gap-2">
            <VStack className="gap-2 w-32">
              <Text className="text-typography-700">Postal code</Text>
              <Input>
                <InputField
                  value={instructions.postalCode ?? ""}
                  placeholder="90210"
                  onChangeText={(v) => set("postalCode", v)}
                  keyboardType="numeric"
                  editable={!isSaving}
                />
              </Input>
            </VStack>
            <VStack className="gap-2 flex-1">
              <Text className="text-typography-700">Country</Text>
              <Input>
                <InputField
                  value={instructions.country ?? "US"}
                  placeholder="US"
                  onChangeText={(v) => set("country", v)}
                  autoCapitalize="characters"
                  editable={!isSaving}
                />
              </Input>
            </VStack>
          </HStack>
        </>
      )}

      <VStack className="gap-2">
        <Text className="text-typography-700">Body template</Text>
        
        <Textarea>
          <TextareaInput
            value={instructions.bodyTemplate ?? ""}
            placeholder="Template text to include in booking messages…"
            onChangeText={(v) => set("bodyTemplate", v)}
            editable={!isSaving}
          />
        </Textarea>
      </VStack>

      <VStack className="gap-2">
        <Text className="text-typography-700">General notes</Text>
        <Textarea>
          <TextareaInput
            value={instructions.generalNotes ?? ""}
            placeholder="General booking notes…"
            onChangeText={(v) => set("generalNotes", v)}
            editable={!isSaving}
          />
        </Textarea>
      </VStack>

      <VStack className="gap-2">
        <Text className="text-typography-700">Notes</Text>
        <Textarea>
          <TextareaInput
            value={instructions.notes ?? ""}
            placeholder="Additional notes…"
            onChangeText={(v) => set("notes", v)}
            editable={!isSaving}
          />
        </Textarea>
      </VStack>

      <Box className="pt-2">
        <Button onPress={onSave} isDisabled={isSaving}>
          {isSaving ? <Spinner size="small" /> : <ButtonText>Save booking instructions</ButtonText>}
        </Button>
      </Box>
    </VStack>
  );
}
