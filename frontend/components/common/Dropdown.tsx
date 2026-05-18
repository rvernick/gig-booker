import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectItem, SelectPortal, SelectTrigger } from "@/components/ui/select";
import { ChevronDownIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { devLog } from "@/common/utils";

export interface DropdownOption { label: string; value: string };

type DropdownProps = {
  value: string;
  disabled?: boolean;
  onSelect: (value: string) => void;
  options: DropdownOption[];
  testID?: string;
  initialLabel?: string;
};

export const Dropdown: React.FC<DropdownProps> = ({
    value,
    disabled=false,
    onSelect,
    options,
    testID="dropdown",
    initialLabel="Choose..."
  }) => {

  const handleSelect = (value: string | undefined) => {
    if (value) {
      devLog('Dropdown onSelect: ', value);
      onSelect(value);
    }
  }

  const getLabelFromValue = (value: string) => {
    return options.find((option) => option.value === value)?.label;
  };
        // selectedValue={value}
//           <SelectInput className="flex-1" aria-label={getLabelFromValue(value)} value={value} testID={testID}/>

        return (
    <Box className="gap-5">
      <Select
        selectedValue={value}
        isDisabled={disabled}
        isRequired={true}
        initialLabel={initialLabel}
        onValueChange={handleSelect}
        testID={testID}>
        <SelectTrigger className="justify-items-end">
          <Text className="flex-1 place-items-stretch">{getLabelFromValue(value)}</Text>
          <SelectIcon className="mr-3 place-items-end" as={ChevronDownIcon} />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop/>
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {options.map(option => (
              <SelectItem key={option.label} label={option.label} value={option.value} />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>
    </Box>
  );
}
