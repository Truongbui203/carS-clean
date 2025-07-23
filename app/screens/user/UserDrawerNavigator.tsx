import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import RentalHistoryScreen from './RentalHistoryScreen';
import { DrawerParamList } from '../../types/navigation';

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function UserDrawerNavigator() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="RentalHistory" component={RentalHistoryScreen} />
    </Drawer.Navigator>
  );
}
