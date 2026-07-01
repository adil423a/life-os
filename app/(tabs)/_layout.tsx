import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Tabs, router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TabLayout() {
  const sheetRef = useRef<BottomSheetModal>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const [activeTab, setActiveTab] = useState<'index' | 'profile'>('index');

  const snapPoints = useMemo(() => ['78%'], []);

  const openSheet = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();

    sheetRef.current?.present();
  };

  const closeSheet = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();

    sheetRef.current?.dismiss();
  };

  const goTo = (path: string) => {
    closeSheet();

    setTimeout(() => {
      router.push(path as any);
    }, 160);
  };

  const goHome = () => {
    setActiveTab('index');
    router.push('/' as any);
  };

  const goProfile = () => {
    setActiveTab('profile');
    router.push('/profile' as any);
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        <View style={styles.root}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: false,
              tabBarStyle: styles.hiddenTabBar,
            }}
          >
            <Tabs.Screen name="index" options={{ title: 'Главная' }} />
            <Tabs.Screen name="profile" options={{ title: 'Профиль' }} />

            <Tabs.Screen name="finance" options={{ href: null }} />
            <Tabs.Screen name="goals" options={{ href: null }} />
            <Tabs.Screen name="ideas" options={{ href: null }} />
            <Tabs.Screen name="analytics" options={{ href: null }} />
          </Tabs>

          <View pointerEvents="box-none" style={styles.floatingLayer}>
            <View style={styles.customTabBar}>
              <TouchableOpacity activeOpacity={0.8} onPress={goHome} style={styles.tabItem}>
                <Text style={[styles.tabIcon, activeTab === 'index' && styles.tabIconActive]}>⌂</Text>
                <Text style={[styles.tabLabel, activeTab === 'index' && styles.tabLabelActive]}>
                  Главная
                </Text>
              </TouchableOpacity>

              <View style={styles.centerSpace} />

              <TouchableOpacity activeOpacity={0.8} onPress={goProfile} style={styles.tabItem}>
                <Text style={[styles.tabIcon, activeTab === 'profile' && styles.tabIconActive]}>👤</Text>
                <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
                  Профиль
                </Text>
              </TouchableOpacity>
            </View>

            <Animated.View style={[styles.plusButtonWrap, { transform: [{ translateX: -38 }, { scale }] }]}>
              <Pressable onPress={openSheet} style={({ pressed }) => [styles.plusButton, pressed && styles.plusButtonPressed]}>
                <Text style={styles.plusText}>+</Text>
              </Pressable>
            </Animated.View>
          </View>

          <BottomSheetModal
            ref={sheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose
            onDismiss={() => {
              Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 18,
                bounciness: 6,
              }).start();
            }}
            backdropComponent={(props) => (
              <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                opacity={0.45}
                pressBehavior="close"
              />
            )}
            handleIndicatorStyle={styles.sheetHandle}
            backgroundStyle={styles.sheetBackground}
          >
            <BottomSheetView style={styles.sheetContent}>
              <View style={styles.sheetHeader}>
                <View style={styles.sheetTitleBlock}>
                  <Text style={styles.sheetTitle}>Что добавить?</Text>
                  <Text style={styles.sheetSubtitle}>Выбери действие для Life OS</Text>
                </View>

                <TouchableOpacity onPress={closeSheet} style={styles.closeButton}>
                  <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actions}>
                <ActionItem icon="💰" title="Доход" subtitle="Добавить поступление денег" onPress={() => goTo('/finance?quick=income')} />
                <ActionItem icon="💸" title="Расход" subtitle="Записать покупку или оплату" onPress={() => goTo('/finance?quick=expense')} />
                <ActionItem icon="🎯" title="Цель" subtitle="Создать новую цель" onPress={() => goTo('/goals?quick=goal')} />
                <ActionItem icon="💡" title="Идея" subtitle="Сохранить мысль или инсайт" onPress={() => goTo('/ideas?quick=idea')} />
                <ActionItem icon="📊" title="Аналитика" subtitle="Посмотреть статистику и отчеты" onPress={() => goTo('/analytics')} />
              </View>
            </BottomSheetView>
          </BottomSheetModal>
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

function ActionItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.actionItem}>
      <View style={styles.actionIconBox}>
        <Text style={styles.actionIcon}>{icon}</Text>
      </View>

      <View style={styles.actionTextBlock}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>

      <Text style={styles.actionArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hiddenTabBar: { display: 'none' },

  floatingLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 112,
    alignItems: 'center',
  },

  customTabBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    height: 74,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  tabItem: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerSpace: { width: 76 },
  tabIcon: { fontSize: 27, color: '#94A3B8' },
  tabIconActive: { color: '#000000' },

  tabLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 3,
  },

  tabLabelActive: { color: '#000000' },

  plusButtonWrap: {
    position: 'absolute',
    left: '52%',
    bottom: 40,
    width: 80,
    height: 40,
  },

  plusButton: {
    width: 50,
    height: 50,
    borderRadius: 38,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',

    elevation: 12,
    borderWidth: 1,
    borderColor: '#000000',
  },

  plusButtonPressed: { opacity: 0.9 },

  plusText: {
    color: '#FFFFFF',
    fontSize: 43,
    fontWeight: '500',
    marginTop: -7,
  },

  sheetHandle: { backgroundColor: '#CBD5E1', width: 70 },

  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
  },

  sheetContent: {
    padding: 24,
    paddingBottom: 64,
  },

  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sheetTitleBlock: {
    flex: 1,
    paddingRight: 16,
  },

  sheetTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
  },

  sheetSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 6,
  },

  closeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 30,
    color: '#64748B',
    marginTop: -2,
  },

  actions: {
    marginTop: 26,
    gap: 14,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 24,
  },

  actionIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  actionIcon: { fontSize: 26 },
  actionTextBlock: { flex: 1 },

  actionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },

  actionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 3,
  },

  actionArrow: {
    fontSize: 34,
    color: '#CBD5E1',
  },
});
