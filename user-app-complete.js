// ─── ONBOARDING ───
function OnboardingScreen({ onDone }) {
  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}}>
      <View style={{flex:1,alignItems:'center',justifyContent:'space-between',padding:28,paddingTop:60}}>
        <View style={{alignItems:'center'}}>
          <Text style={{fontSize:72,fontWeight:'900',color:'#fff',lineHeight:66,letterSpacing:-2,textAlign:'center'}}>
            OUT<Text style={{color:theme.orange}}>&</Text>{'\n'}ABOUT
          </Text>
          <Text style={{color:theme.muted,fontSize:16,textAlign:'center',marginTop:16,lineHeight:24}}>
            Deals from shops near you.{'\n'}Walk in. Save. Simple.
          </Text>
        </View>
        <View style={{backgroundColor:theme.card,borderRadius:20,padding:24,width:'100%',alignItems:'center'}}>
          <Text style={{fontSize:36,marginBottom:10}}>📍</Text>
          <Text style={{fontSize:16,fontWeight:'700',color:theme.text,marginBottom:8}}>We need your location</Text>
          <Text style={{fontSize:13,color:theme.muted,textAlign:'center',lineHeight:20}}>
            So we can show you deals from shops within walking distance.
          </Text>
        </View>
        <View style={{width:'100%',gap:14}}>
          <TouchableOpacity style={{backgroundColor:theme.orange,borderRadius:50,padding:16,alignItems:'center'}} onPress={onDone}>
            <Text style={{color:'#fff',fontSize:17,fontWeight:'700'}}>Allow Location & Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDone}>
            <Text style={{color:theme.muted,fontSize:13,textAlign:'center'}}>Browse without location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── HOME (DEAL FEED) ───
const FILTERS = ['All Deals', '☕ Food & Drink', '✂️ Beauty', '🛍️ Retail', '🎉 Flash Sales'];

function HomeScreen({ navigation }) {
  const { saved, setSaved, deals, timers } = useContext(AppContext);
  const [filter, setFilter] = useState('All Deals');

  const filtered = deals.filter(d => {
    if (filter === 'All Deals') return true;
    if (filter === '🎉 Flash Sales') return d.deal_type === 'flash_sale';
    const cm = { '☕ Food & Drink': ['cafe','restaurant','bakery','pizza','takeaway'],
                 '✂️ Beauty': ['beauty','barber'],
                 '🛍️ Retail': ['retail','fashion','electronics','grocery'] };
    return cm[filter]?.includes(d.category);
  });

  const uc = u => u === 'high' ? theme.red : u === 'medium' ? theme.yellow : theme.green;

  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}}>
      <View style={s.topbar}>
        <Text style={s.logo}>OUT<Text style={s.amp}>&</Text>ABOUT</Text>
        <TouchableOpacity style={{borderWidth:1.5,borderColor:theme.orange,borderRadius:20,paddingHorizontal:10,paddingVertical:5}}
          onPress={() => navigation.navigate('StoreLogin')}>
          <Text style={{color:theme.orange,fontSize:10,fontWeight:'800',textTransform:'uppercase'}}>Shop Login</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{maxHeight:52,paddingVertical:8}}
        contentContainerStyle={{paddingHorizontal:16,gap:8}}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.fchip, filter === f && s.fchipSel]} onPress={() => setFilter(f)}>
            <Text style={[s.fchipText, filter === f && s.fchipTextSel]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={d => d.id}
        contentContainerStyle={{paddingBottom:100}}
        ListHeaderComponent={<Text style={s.secLabel}>{filter === 'All Deals' ? '🔴 Live Deals Near You' : `${filter} Deals`}</Text>}
        ListEmptyComponent={<View style={{alignItems:'center',paddingTop:60}}><Text style={{fontSize:48}}>🔍</Text><Text style={{fontSize:15,color:theme.muted,marginTop:12}}>No deals found.</Text></View>}
        renderItem={({item}) => {
          const isSaved = saved?.has(item.id);
          const tc = uc(item.urgency);
          const ti = getDealTypeInfo(item.deal_type);
          const tms = (timers[item.id]||0)*1000;
          return (
            <TouchableOpacity style={s.dealCard} onPress={() => navigation.navigate('Detail',{deal:item,timerMs:tms})} activeOpacity={0.85}>
              <View style={[s.dealImg,{backgroundColor:item.bgColor}]}>
                <Text style={{fontSize:48}}>{item.emoji}</Text>
                <View style={[s.urgencyBadge,{backgroundColor:tc+'22',borderColor:tc}]}>
                  <Text style={[s.urgencyText,{color:tc}]}>{item.urgency==='high'?'🔴 Ends Soon':ti.label}</Text>
                </View>
                <TouchableOpacity style={s.favBtn} onPress={() => { const n=new Set(saved); isSaved?n.delete(item.id):n.add(item.id); setSaved(n); }}>
                  <Text style={{fontSize:18}}>{isSaved?'❤️':'🤍'}</Text>
                </TouchableOpacity>
              </View>
              <View style={s.dealBody}>
                <View style={s.dealTopRow}>
                  <Text style={s.dealTitle} numberOfLines={2}>{item.discount_percent?`${item.discount_percent}% Off `:''}{item.title}</Text>
                  <Text style={s.dealDist}>{item.distance}</Text>
                </View>
                <Text style={s.dealShop}>{item.emoji} {item.shop_name}</Text>
                {item.discount_price&&item.original_price&&(
                  <View style={{flexDirection:'row',alignItems:'center',gap:6,marginVertical:4}}>
                    <Text style={{fontSize:12,color:theme.muted,textDecorationLine:'line-through'}}>{CURRENCY_SYMBOLS[item.currency||'GBP']}{item.original_price}</Text>
                    <Text style={{fontSize:16,fontWeight:'700',color:theme.orange}}>{CURRENCY_SYMBOLS[item.currency||'GBP']}{item.discount_price}</Text>
                    {item.discount_percent&&<View style={{backgroundColor:theme.green+'22',borderRadius:4,paddingHorizontal:6,paddingVertical:2}}><Text style={{fontSize:11,color:theme.green,fontWeight:'700'}}>-{item.discount_percent}%</Text></View>}
                  </View>
                )}
                {item.referral_reward_type!=='none'&&<View style={{flexDirection:'row',alignItems:'center',gap:4,marginVertical:2}}><Text style={{fontSize:11}}>🎁</Text><Text style={{fontSize:11,color:theme.muted}}>Refer a friend: {item.referral_reward||'get a reward'}</Text></View>}
                <View style={s.dealBottom}>
                  <Text style={[s.countdown,{color:tc}]}>⏱ {fmtTimeLeft(tms)}</Text>
                  <TouchableOpacity style={s.shareBtn} onPress={() => Share.share({message:`Check this out — ${item.title} at ${item.shop_name}!`})}>
                    <Text style={s.shareBtnText}>💬 Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

// ─── DEAL DETAIL ───
function DealDetailScreen({ route, navigation }) {
  const { deal, timerMs: initTimer } = route.params;
  const { saved, setSaved } = useContext(AppContext);
  const [timer, setTimer] = useState(initTimer??3600000);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [cd, setCd] = useState(60);

  useEffect(() => { const id=setInterval(()=>setTimer(t=>Math.max(0,t-1000)),1000); return ()=>clearInterval(id); }, []);

  const isSaved = saved?.has(deal.id);
  const ti = getDealTypeInfo(deal.deal_type);
  const pct = timer/(initTimer||3600000);

  const handleRedeem = () => {
    setRedeeming(true);
    const id = setInterval(() => setCd(c => {
      if (c <= 1) { clearInterval(id); setRedeeming(false); setRedeemed(true); return 0; }
      return c - 1;
    }), 1000);
  };

  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}}>
      <ScrollView contentContainerStyle={{paddingBottom:120}}>
        <View style={{backgroundColor:deal.bgColor||'#1a0f00',height:240,justifyContent:'center',alignItems:'center',position:'relative'}}>
          <Text style={{fontSize:80}}>{deal.emoji||'🎉'}</Text>
          <TouchableOpacity style={{position:'absolute',top:16,left:16,width:36,height:36,borderRadius:18,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',alignItems:'center'}} onPress={()=>navigation.goBack()}>
            <Text style={{color:'#fff',fontSize:18}}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{position:'absolute',top:16,right:16,width:36,height:36,borderRadius:18,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',alignItems:'center'}} onPress={()=>{const n=new Set(saved);isSaved?n.delete(deal.id):n.add(deal.id);setSaved(n);}}>
            <Text style={{fontSize:18}}>{isSaved?'❤️':'🤍'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{alignSelf:'flex-start',backgroundColor:ti.color+'20',borderRadius:8,paddingHorizontal:12,paddingVertical:4,marginHorizontal:16,marginTop:-20,marginBottom:12}}>
          <Text style={{color:ti.color,fontWeight:'700',fontSize:13}}>{ti.emoji} {ti.label}</Text>
        </View>
        <View style={{paddingHorizontal:16}}>
          <Text style={{fontSize:24,fontWeight:'bold',color:theme.text,marginBottom:8}}>{deal.title}</Text>
          <Text style={{fontSize:14,color:theme.orange,fontWeight:'600',marginBottom:4}}>{deal.emoji||'🏪'} {deal.shop_name}</Text>
          <Text style={{fontSize:13,color:theme.muted,marginBottom:16}}>📍 {deal.address||'Local shop'} | {deal.distance||''}</Text>
          {deal.discount_price&&deal.original_price&&(
            <View style={{backgroundColor:theme.card,borderRadius:12,padding:16,marginBottom:16,flexDirection:'row',alignItems:'center'}}>
              <View style={{flex:1}}>
                <Text style={{fontSize:12,color:theme.muted}}>Price</Text>
                <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                  <Text style={{fontSize:18,color:theme.muted,textDecorationLine:'line-through'}}>{CURRENCY_SYMBOLS[deal.currency||'GBP']}{deal.original_price}</Text>
                  <Text style={{fontSize:28,fontWeight:'bold',color:theme.orange}}>{CURRENCY_SYMBOLS[deal.currency||'GBP']}{deal.discount_price}</Text>
                </View>
              </View>
              <View style={{backgroundColor:theme.green+'20',borderRadius:8,paddingHorizontal:12,paddingVertical:6}}>
                <Text style={{color:theme.green,fontWeight:'700',fontSize:16}}>-{deal.discount_percent||Math.round((1-deal.discount_price/deal.original_price)*100)}%</Text>
              </View>
            </View>
          )}
          <View style={{backgroundColor:theme.card,borderRadius:12,padding:16,marginBottom:16}}>
            <Text style={{fontSize:12,color:theme.muted,marginBottom:4}}>{timer>0?'⏱ Time Remaining':'⏱ Deal Ended'}</Text>
            <Text style={{fontSize:36,fontWeight:'bold',color:timer<3600000?theme.red:theme.orange,fontVariant:['tabular-nums']}}>{fmtTimeLeft(timer)}</Text>
            <View style={{height:4,backgroundColor:theme.border,borderRadius:2,marginTop:8,overflow:'hidden'}}>
              <View style={{height:'100%',borderRadius:2,backgroundColor:timer<3600000?theme.red:theme.orange,width:`${pct*100}%`}} />
            </View>
          </View>
          {deal.description&&(
            <View style={{backgroundColor:theme.card,borderRadius:12,padding:16,marginBottom:16}}>
              <Text style={{fontSize:12,color:theme.muted,marginBottom:6}}>About this deal</Text>
              <Text style={{fontSize:15,color:theme.text,lineHeight:22}}>{deal.description}</Text>
            </View>
          )}
          {deal.referral_reward_type!=='none'&&deal.referral_reward&&(
            <View style={{backgroundColor:theme.card,borderRadius:12,padding:16,marginBottom:16,borderWidth:1,borderColor:theme.yellow+'40'}}>
              <Text style={{fontSize:12,color:theme.yellow,marginBottom:4,fontWeight:'600'}}>🎁 Double Bubble — Refer a Friend</Text>
              <Text style={{fontSize:14,color:theme.text}}>Share this deal and you both get: {deal.referral_reward}</Text>
              <TouchableOpacity style={{marginTop:8,alignSelf:'flex-start',backgroundColor:theme.yellow+'20',borderRadius:6,paddingHorizontal:12,paddingVertical:6}} onPress={()=>Share.share({message:`Check this out — ${deal.title} at ${deal.shop_name}!`})}>
                <Text style={{color:theme.yellow,fontWeight:'600',fontSize:12}}>Share Deal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      {timer>0&&!redeemed&&(
        <View style={{position:'absolute',bottom:0,left:0,right:0,padding:16,paddingBottom:Platform.OS==='ios'?34:16,backgroundColor:theme.bg,borderTopWidth:1,borderTopColor:theme.border}}>
          <TouchableOpacity style={{backgroundColor:redeeming?theme.card:theme.orange,borderRadius:16,padding:18,alignItems:'center',opacity:redeeming?0.7:1}} onPress={handleRedeem} disabled={redeeming}>
            {redeeming ? <Text style={{color:theme.text,fontSize:16}}>Showing to shop in {cd}s...</Text> : <Text style={{color:'#fff',fontSize:18,fontWeight:'700'}}>Redeem Deal</Text>}
          </TouchableOpacity>
        </View>
      )}
      {redeemed&&(
        <View style={{position:'absolute',bottom:0,left:0,right:0,padding:16,paddingBottom:Platform.OS==='ios'?34:16,backgroundColor:theme.green+'15',borderTopWidth:1,borderTopColor:theme.green+'30'}}>
          <View style={{alignItems:'center'}}>
            <Text style={{fontSize:16,fontWeight:'700',color:theme.green}}>✅ Deal Redeemed!</Text>
            <Text style={{fontSize:12,color:theme.muted,marginTop:2}}>Show this to the shop staff to claim your deal.</Text>
            <TouchableOpacity style={{marginTop:8,padding:8,borderRadius:8,borderWidth:1,borderColor:theme.border}} onPress={()=>setRedeemed(false)}>
              <Text style={{fontSize:12,color:theme.muted}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── ADDITIONAL SCREENS ───
function MapScreen({ navigation }) {
  const { deals } = useContext(AppContext);
  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}}>
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <Text style={{fontSize:48}}>🗺️</Text>
        <Text style={{fontSize:18,fontWeight:'700',color:theme.text,marginTop:16}}>Map View Coming Soon</Text>
        <Text style={{fontSize:14,color:theme.muted,textAlign:'center',marginTop:8,marginHorizontal:40}}>See nearby deals on a map with 2-mile radius.</Text>
      </View>
    </SafeAreaView>
  );
}

function SavedScreen({ navigation }) {
  const { saved, deals } = useContext(AppContext);
  const sd = deals.filter(d => saved?.has(d.id));
  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}}>
      <FlatList data={sd} keyExtractor={d=>d.id} contentContainerStyle={{padding:16,paddingBottom:100}}
        ListHeaderComponent={<Text style={{fontSize:22,fontWeight:'700',color:theme.text,marginBottom:16}}>❤️ Saved Deals</Text>}
        ListEmptyComponent={<View style={{alignItems:'center',paddingTop:60}}><Text style={{fontSize:48}}>💔</Text><Text style={{fontSize:15,color:theme.muted,marginTop:12}}>No saved deals yet.</Text></View>}
        renderItem={({item}) => (
          <TouchableOpacity style={{backgroundColor:theme.card,borderRadius:16,padding:16,marginBottom:8,flexDirection:'row',alignItems:'center',gap:12}}
            onPress={()=>navigation.navigate('Detail',{deal:item,timerMs:3600000})}>
            <Text style={{fontSize:32}}>{item.emoji||'🎉'}</Text>
            <View style={{flex:1}}><Text style={{color:theme.text,fontWeight:'600',fontSize:15}} numberOfLines={1}>{item.title}</Text><Text style={{color:theme.muted,fontSize:13}}>{item.shop_name} · {item.distance||''}</Text></View>
            <Text style={{fontSize:18,color:theme.red}}>❤️</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function AlertsScreen() {
  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}}>
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <Text style={{fontSize:48}}>🔕</Text>
        <Text style={{fontSize:15,color:theme.muted,marginTop:12}}>No notifications yet</Text>
      </View>
    </SafeAreaView>
  );
}

function StoreLoginScreen({ navigation }) {
  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}}>
      <View style={{flex:1,justifyContent:'center',alignItems:'center',padding:28}}>
        <TouchableOpacity style={{position:'absolute',top:16,left:16,width:36,height:36,borderRadius:18,backgroundColor:theme.card,justifyContent:'center',alignItems:'center'}} onPress={()=>navigation.goBack()}>
          <Text style={{color:'#fff',fontSize:18}}>←</Text>
        </TouchableOpacity>
        <Text style={{fontSize:48,marginBottom:16}}>🏪</Text>
        <Text style={{fontSize:22,fontWeight:'700',color:theme.text,textAlign:'center'}}>Store Owner Login</Text>
        <Text style={{fontSize:14,color:theme.muted,textAlign:'center',marginTop:8,marginBottom:32}}>Sign in to manage your deals</Text>
        <View style={{width:'100%',maxWidth:400}}>
          <Text style={{color:theme.text,fontWeight:'600',fontSize:13,marginBottom:6}}>Email</Text>
          <TextInput style={{backgroundColor:theme.card,borderRadius:12,padding:14,fontSize:16,color:theme.text,borderWidth:1,borderColor:theme.border,marginBottom:12}} placeholder="your@email.com" placeholderTextColor={theme.muted} keyboardType="email-address" autoCapitalize="none" />
          <Text style={{color:theme.text,fontWeight:'600',fontSize:13,marginBottom:6}}>Password</Text>
          <TextInput style={{backgroundColor:theme.card,borderRadius:12,padding:14,fontSize:16,color:theme.text,borderWidth:1,borderColor:theme.border,marginBottom:24}} placeholder="Enter password" placeholderTextColor={theme.muted} secureTextEntry />
          <TouchableOpacity style={{backgroundColor:theme.orange,borderRadius:12,padding:16,alignItems:'center',marginBottom:8}} onPress={()=>{}}>
            <Text style={{color:'#fff',fontSize:16,fontWeight:'700'}}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── NAVIGATION ───
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {backgroundColor:theme.card,borderTopColor:theme.border,borderTopWidth:1,paddingTop:4,height:60},
        tabBarActiveTintColor: theme.orange,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: {fontSize:11,fontWeight:'600',marginBottom:4},
      }}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{tabBarLabel:'Home',tabBarIcon:({color})=><Text style={{fontSize:20,color}}>🏠</Text>}} />
      <Tab.Screen name="Map" component={MapScreen} options={{tabBarLabel:'Map',tabBarIcon:({color})=><Text style={{fontSize:20,color}}>🗺️</Text>}} />
      <Tab.Screen name="Saved" component={SavedScreen} options={{tabBarLabel:'Saved',tabBarIcon:({color})=><Text style={{fontSize:20,color}}>❤️</Text>}} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{tabBarLabel:'Alerts',tabBarIcon:({color})=><Text style={{fontSize:20,color}}>🔔</Text>}} />
    </Tab.Navigator>
  );
}

// ─── APP ───
export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [saved, setSaved] = useState(new Set());
  const [deals, setDeals] = useState(buildSampleDeals());
  const [timers, setTimers] = useState({});

  useEffect(() => {
    const it = {};
    deals.forEach(d => { it[d.id] = d.timerSecs || 3600; });
    setTimers(it);
    const id = setInterval(() => setTimers(prev => {
      const next = {};
      for (const [k,v] of Object.entries(prev)) next[k] = Math.max(0, v - 1);
      return next;
    }), 1000);
    return () => clearInterval(id);
  }, []);

  if (!onboarded) return <OnboardingScreen onDone={() => setOnboarded(true)} />;

  return (
    <AppContext.Provider value={{ saved, setSaved, deals, timers }}>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Detail" component={DealDetailScreen} />
          <Stack.Screen name="StoreLogin" component={StoreLoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

// ─── STYLES ───
const s = StyleSheet.create({
  topbar: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:12 },
  logo: { fontSize:20, fontWeight:'900', color:'#fff', letterSpacing:1.5 },
  amp: { color:theme.orange },
  fchip: { paddingHorizontal:14, paddingVertical:6, borderRadius:20, backgroundColor:theme.card, borderWidth:1, borderColor:theme.border },
  fchipSel: { backgroundColor:theme.orange, borderColor:theme.orange },
  fchipText: { fontSize:12, color:theme.muted, fontWeight:'600' },
  fchipTextSel: { color:'#fff' },
  secLabel: { fontSize:15, fontWeight:'700', color:theme.text, marginBottom:8, paddingHorizontal:16 },
  dealCard: { backgroundColor:theme.card, borderRadius:16, overflow:'hidden', marginHorizontal:16, marginBottom:12 },
  dealImg: { height:120, justifyContent:'center', alignItems:'center', position:'relative' },
  urgencyBadge: { position:'absolute', bottom:8, left:8, borderRadius:6, borderWidth:1, paddingHorizontal:8, paddingVertical:2 },
  urgencyText: { fontSize:10, fontWeight:'700' },
  favBtn: { position:'absolute', top:8, right:8, width:32, height:32, borderRadius:16, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center' },
  dealBody: { padding:14 },
  dealTopRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' },
  dealTitle: { fontSize:16, fontWeight:'700', color:theme.text, flex:1, marginRight:8 },
  dealDist: { fontSize:11, color:theme.muted, fontWeight:'500' },
  dealShop: { fontSize:13, color:theme.orange, marginTop:2 },
  dealBottom: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:8 },
  countdown: { fontSize:13, fontWeight:'600' },
  shareBtn: { borderWidth:1, borderColor:theme.border, borderRadius:8, paddingHorizontal:10, paddingVertical:4 },
  shareBtnText: { fontSize:11, color:theme.muted },
});