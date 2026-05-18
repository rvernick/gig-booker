
import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from'@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSession } from '@/common/ctx';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from '../ui/vstack';
import { HStack } from '../ui/hstack';
import { ScrollView } from '../ui/scroll-view';
import { CheckIcon, FilterIcon, ArrowUpDownIcon, XIcon } from 'lucide-react-native';
import { Pressable } from '../ui/pressable';
import { Text } from '../ui/text';
import { User } from '@/models/User';

import { allUsers } from '@/common/data-utils';
import { devLog, ensureString } from '@/common/utils';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '../ui/checkbox';
import CoSAvatarComponent from '../common/CoSAvatarComponent';
import { Heading } from '../ui/heading';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '../ui/select';
import { ChevronDownIcon, Icon } from '../ui/icon';
import { Input, InputField } from '../ui/input';

type UserListProps = {
  users: User[] | undefined;
  isUpdating: boolean;
  isInFocus: boolean;
};

// Example component
const UserListComponent = () => {
  const session = useSession();
  const username = session.username ? session.username : '';
  const router = useRouter();
  const isFocused = useIsFocused();
  const [isUpdating, setIsUpdating] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'firstName' | 'lastName' | 'username'>('lastName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data, error, isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: () => allUsers(session, username),
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    refetchOnMount: 'always',
    initialData: [],
  })

  const UserList: React.FC<UserListProps> = ({ users, isUpdating, isInFocus }) => {
    return (
      <VStack className="w-full h-full">
        {users && users.length > 0? (
          users?.map(user => (
            <UserRow key={'user: ' + user.id } user={user} />
        ))) : (
          <Text> No Users Found</Text>
        )}
      </VStack>
    );
  };

  type UserRowProps = {
    user: User;
  };

  const UserRow: React.FC<UserRowProps> = ({ user }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const syncName = async (user: User) => {
      let fullName = ensureString(user.firstName) + ' ' + ensureString(user.lastName);
      setName(fullName);
    }

    const syncDescription = async (user: User) => {
      if (user.homeLocation) {
        setDescription(user.homeLocation?.formattedAddress)
      } else {
        setDescription(user.mobile);
      }
    }
    useEffect(() => {
      syncDescription(user);
      syncName(user);
    }, [user]);

    const handlePress = () => {
      // router.push({
      //   pathname: '/(secure)/(home)/(admin)/users'
      //   params: { username: user.username }
      // })
    };

    return (
      <Pressable
        onPress={handlePress}
      >
        <HStack className='row-primary' key={'user: ' + user.id} >
          <CoSAvatarComponent size='md' photoId={user.photo?.id} fallbackText={user.firstName} />
          <VStack className="flex-1">
            <Text className="text-xl">   {name}</Text>
            <Text className="text-typography-600">     {description}</Text>
          </VStack>
        </HStack>
      </Pressable>
    );
  };

  useEffect(() => {
    if (isUpdating && !isFetching) {
      devLog('sync updating users');
      setIsUpdating(false);
    }
  });

  const matchesText = (user: User, filterText: string): boolean => {
    const filterString = filterText.toLowerCase();
    return ensureString(user.username).toLowerCase().includes(filterString)
    || ensureString(user.firstName).toLowerCase().includes(filterString)
    || ensureString(user.lastName).toLowerCase().includes(filterString);
  }

  useEffect(() => {
    if (data) {
      let result = [...data];

      if (filterText.length > 0) {
        const filterString = filterText.toLowerCase();
        result = result.filter(u => matchesText(u, filterString));
      }

      result.sort((a, b) => {
        let valA = ensureString(a[sortBy]).toLowerCase();
        let valB = ensureString(b[sortBy]).toLowerCase();
        if (valA === '') valA = a.username;
        if (valB === '') valB = b.username;
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      setFilteredUsers(result);
    }
  }, [data, filterText, sortBy, sortOrder]);

  if (error) {
    return (
      <Text>
        An error occurred!
      </Text>
    )
  }

  if (isFetching) {
    return (
      <Text>
        Fetching users...
      </Text>
    )
  } else if (data && data.length > 0) {
    return (
      <SafeAreaView className="w-full h-full bottom-1 bg-white">
        <VStack className="w-full h-full">
          <Pressable onPress={() => setShowFilters(!showFilters)} className="p-2">
            <HStack className="justify-between items-center p-4 border-b border-gray-200">
              <Heading size="lg">Users ({filteredUsers.length})</Heading>
                {showFilters ? <XIcon size={24} color="black"/> : <FilterIcon size={24} color="black"/>}
            </HStack>
          </Pressable>
          {showFilters && (
            <VStack className="p-4 bg-gray-50 space-y-4 border-b border-gray-200">
              <HStack space="md" className="items-center z-40">
                <Text className="font-semibold w-16">Filter:</Text>
                <Input className='flex-1'>
                  <InputField
                    placeholder="filter name by..."
                    value={filterText}
                    onChangeText={setFilterText}
                    keyboardType="default"
                  />
                </Input>
              </HStack>
              <HStack space="md" className="items-center z-50">
                <Text className="font-semibold w-16">Sort:</Text>
                <VStack className="flex-1">
                  <Select selectedValue={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger>
                      <SelectInput placeholder="Sort by..." />
                      <Icon as={ChevronDownIcon} className="mr-3" />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                        <SelectItem label="First Name" value="firstName" />
                        <SelectItem label="Last Name" value="lastName" />
                        <SelectItem label="Username" value="username" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </VStack>
                <Pressable onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-2 border border-gray-300 rounded bg-white">
                  <ArrowUpDownIcon size={20} color="black" />
                </Pressable>
              </HStack>
            </VStack>
          )}
          <ScrollView
            className="w-full h-full"
            contentContainerStyle={{ flexGrow: 1 }}
          >
          <UserList users={filteredUsers} isUpdating={isFetching} isInFocus={isFocused}/>
          </ScrollView>
        </VStack>
      </SafeAreaView>
    )
  } else {
    return (
      <VStack className="w-full h-full items-center justify-center">
        <Text className="text-lg text-typography-600"> No Users Found</Text>
      </VStack>
    )
  };
};

export default UserListComponent;
