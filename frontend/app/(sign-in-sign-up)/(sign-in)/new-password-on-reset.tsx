import { ensureString } from "@/common/utils";
import { NewPasswordOnResetComponent } from "@/components/account/NewPasswordOnResetComponent";
import { useLocalSearchParams } from "expo-router";

const NewPasswordOnReset = () => {
  const resetInfo = useLocalSearchParams();

  return (
    <NewPasswordOnResetComponent token={ensureString(resetInfo.token)}/>
  );

};

export default NewPasswordOnReset;
