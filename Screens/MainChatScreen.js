import React, { useState, useRef  } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SafeAreaComponent from './Components/SafeAreaComponent';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, Animated, Linking, Modal } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = "AIzaSyDLXK0-XaGco3EMUcwTLTpXjiTrVPY97SM"; // Replace with your API key
const RESCUEBOT_DIRECTIVE = `
  You are RescueBot, a virtual AI assistant specialized in emergency response.
  Your job is to assist users by providing evidence-based practices for emergency situations.
  Respond with clear, concise, and actionable advice tailored to the emergency prompt provided.
  Always remain professional, calm, and focused.
`;
const YOUTUBE_API_KEY = "AIzaSyBZUfQjcNENqJ4-V-DFX-2bZkgvEbU-wpM"; // Your API key
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";
const presetQuestions = [
  { id: '1', text: 'What should I do in case of fire?' },
  { id: '2', text: 'How to perform basic CPR?' },
  { id: '3', text: 'Report a medical emergency' },
  { id: '4', text: 'Natural disaster protocols' },
];



const TypingIndicator = () => {
    const [dot1] = useState(new Animated.Value(0));
    const [dot2] = useState(new Animated.Value(0));
    const [dot3] = useState(new Animated.Value(0));
  
    React.useEffect(() => {
      const animateDot = (dot, delay) => {
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      };
  
      const animate = () => {
        animateDot(dot1, 0);
        animateDot(dot2, 200);
        animateDot(dot3, 400);
      };
  
      const interval = setInterval(animate, 1200);
      return () => clearInterval(interval);
    }, []);
  
    const getDotStyle = (dot) => ({
      opacity: dot,
      transform: [{
        translateY: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      }],
    });
    
  return (
    <View style={styles.typingContainer}>
      <Image source={require('./assets/logo-rm.png')} style={styles.botIconSmall} />
      <View style={styles.dotsContainer}>
        {[dot1, dot2, dot3].map((dot, index) => (
          <Animated.View key={index} style={[styles.dot, getDotStyle(dot)]} />
        ))}
      </View>
    </View>
  );
};

export default function MainChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
const [selectedVideoId, setSelectedVideoId] = useState(null);
const [playing, setPlaying] = useState(false);

  const fetchYouTubeVideos = async (query) => {
    try {
      // Add "tutorial" or "guide" to make results more relevant
      const searchQuery = `${query} tutorial guide short`;
      const encodedQuery = encodeURIComponent(searchQuery);
      
      console.log("1. Starting YouTube search with query:", searchQuery);
      
      // Construct search URL
      const searchUrl = `${YOUTUBE_API_URL}?key=${YOUTUBE_API_KEY}&q=${encodedQuery}&part=snippet&type=video&maxResults=5`;
      console.log("2. Search URL (without API key):", searchUrl.replace(YOUTUBE_API_KEY, 'API_KEY'));
      
      // Fetch search results
      const response = await fetch(searchUrl);
      console.log("3. Search Response Status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log("4. Search Error Response:", errorText);
        throw new Error(`YouTube search failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("5. Search Results:", JSON.stringify(data, null, 2));
      
      if (!data.items || data.items.length === 0) {
        console.log("6. No videos found in search results");
        return null;
      }
  
      // Extract video IDs
      const videoIds = data.items.map(item => item.id.videoId).join(',');
      console.log("7. Video IDs found:", videoIds);
  
      // Construct details URL
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds}&part=contentDetails,snippet`;
      console.log("8. Details URL (without API key):", detailsUrl.replace(YOUTUBE_API_KEY, 'API_KEY'));
  
      // Fetch video details
      const detailsResponse = await fetch(detailsUrl);
      console.log("9. Details Response Status:", detailsResponse.status);
  
      if (!detailsResponse.ok) {
        const errorText = await detailsResponse.text();
        console.log("10. Details Error Response:", errorText);
        throw new Error(`Video details fetch failed: ${detailsResponse.status} - ${errorText}`);
      }
  
      const detailsData = await detailsResponse.json();
      console.log("11. Video Details:", JSON.stringify(detailsData, null, 2));
  
      // Filter videos less than 1 minute
      const shortVideos = detailsData.items.filter(video => {
        const duration = video.contentDetails.duration;
        const match = duration.match(/PT(\d+M)?(\d+S)?/);
        const minutes = match[1] ? parseInt(match[1]) : 0;
        const seconds = match[2] ? parseInt(match[2]) : 0;
        console.log(`12. Video ${video.id} duration: ${minutes}m${seconds}s`);
        return minutes === 0 && seconds <= 60;
      });
  
      console.log("13. Number of short videos found:", shortVideos.length);
  
      if (shortVideos.length > 0) {
        const video = shortVideos[0];
        const videoData = {
          id: video.id,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails.medium.url,
          url: `https://www.youtube.com/watch?v=${video.id}`
        };
        console.log("14. Returning video data:", videoData);
        return videoData;
      }
  
      console.log("15. No suitable short videos found");
      return null;
  
    } catch (error) {
      console.error("16. YouTube API Error:", error);
      return null;
    }
  };
  
  // Update handleSend to include logging
  const handleSend = async (text = inputText) => {
    if (text.trim()) {
      console.log("1. Starting message send with text:", text);
      
      const userMessage = { id: Date.now(), text, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      setLoading(true);
  
      try {
        console.log("2. Starting YouTube fetch");
        const videoPromise = fetchYouTubeVideos(text);
        
        console.log("3. Starting Gemini API call");
        const payload = {
          contents: [{
            parts: [{ text: `${RESCUEBOT_DIRECTIVE}\nUser Prompt: ${text}` }]
          }]
        };
  
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
  
        console.log("4. Gemini API Response Status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log("5. Gemini Error Response:", errorText);
          throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
        }
  
        const data = await response.json();
        console.log("6. Waiting for video fetch to complete");
        const video = await videoPromise;
        console.log("7. Video fetch result:", video);
  
        const botMessage = {
          id: Date.now() + 1,
          text: data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process your request.",
          sender: 'bot',
          video: video
        };
  
        console.log("8. Adding bot message with video:", botMessage);
        setMessages(prev => [...prev, botMessage]);
        
      } catch (error) {
        console.error("9. Error in handleSend:", error);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: "Error: Unable to get a response from the server.",
          sender: 'bot'
        }]);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const flatListRef = useRef(null);
  const renderChatMessage = ({ item }) => (
    <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.botRow]}>
      {item.sender === 'bot' && (
        <Image source={require('./assets/logo-rm.png')} style={styles.botIconSmall} />
      )}
      <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.botText]}>
          {item.text.split(/(\*\*.*?\*\*)/).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <Text key={index} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>;
            }
            return part;
          })}
        </Text>
        {item.video && (
          <View style={styles.videoContainer}>
            <TouchableOpacity
              onPress={() => {
                setSelectedVideoId(item.video.id);
                setVideoModalVisible(true);
                setPlaying(true);
              }}
            >
              <Image source={{ uri: item.video.thumbnail }} style={styles.videoThumbnail} />
              <View style={styles.playButton}>
                <Ionicons name="play-circle" size={40} color="red" />
              </View>
              <Text style={styles.videoTitle}>{item.video.title}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaComponent backgroundColor="black">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Add this line
     
        >
        
        <View style={{ flex: 1 }}> 
        {messages.length === 0 ? (
            <>
          <View style={styles.welcomeContainer}>
            <Image
              source={require('./assets/logo-rm.png')}
              style={styles.logo}
            />
            <Text style={styles.welcomeTitle}>Welcome to RescueBot</Text>
            <Text style={styles.welcomeSubtitle}>Choose a question or type your emergency:</Text>
            <View style={styles.presetsWrapper}>
              <FlatList
                data={presetQuestions}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.presetCard}
                    onPress={() => handleSend(item.text)}>
                    <Text style={styles.presetText}>{item.text}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.presetContainer}
              />
            </View>
          </View>
          <LinearGradient
                colors={['rgba(0, 0, 0, 0.7)', 'rgba(0,0,0, 0.8)']}
                style={styles.inputContainer}
              >
                <TextInput
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type your message..."
                  placeholderTextColor="#666"
                  editable={!loading}
                />
                <TouchableOpacity 
                  style={styles.sendButton} 
                  onPress={() => handleSend()} 
                  disabled={loading}
                >
                  <Ionicons name="send" size={24} color={loading ? '#888' : 'red'} />
                </TouchableOpacity>
              </LinearGradient>
              </>
        ) : (
            <>
              <View style={styles.header}>
                <Image source={require('./assets/logo-rm.png')} style={styles.headerLogo} />
                <Text style={styles.headerTitle}>RescueBot</Text>
              </View>
  
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderChatMessage}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.messageContainer}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListFooterComponent={() => loading ? <TypingIndicator /> : null}
              />
  
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.7)', 'rgba(0,0,0, 0.8)']}
                style={styles.inputContainer}
              >
                <TextInput
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type your message..."
                  placeholderTextColor="#666"
                  editable={!loading}
                />
                <TouchableOpacity 
                  style={styles.sendButton} 
                  onPress={() => handleSend()} 
                  disabled={loading}
                >
                  <Ionicons name="send" size={24} color={loading ? '#888' : 'red'} />
                </TouchableOpacity>
              </LinearGradient>
            </>
          )}
          </View>
      </KeyboardAvoidingView>
      <Modal
  animationType="slide"
  transparent={true}
  visible={videoModalVisible}
  onRequestClose={() => {
    setVideoModalVisible(false);
    setPlaying(false);
  }}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          setVideoModalVisible(false);
          setPlaying(false);
        }}
      >
        <Ionicons name="close-circle" size={30} color="white" />
      </TouchableOpacity>
      {selectedVideoId && (
        <YoutubePlayer
          height={250}
          play={playing}
          videoId={selectedVideoId}
          onChangeState={(state) => {
            if (state === "ended") {
              setPlaying(false);
            }
          }}
        />
      )}
    </View>
  </View>
</Modal>
    </SafeAreaComponent>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  welcomeContainer: { flex: 1, alignItems: 'center', padding: 20, paddingTop: 60 },
  logo: { width: 200, height: 200, marginBottom: 24 },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
  welcomeSubtitle: { fontSize: 16, color: '#888', marginBottom: 24, textAlign: 'center' },
  presetsWrapper: { width: '100%' },
  presetContainer: { alignItems: 'center' },
  presetCard: { width: '45%', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, margin: 8, minHeight: 100, justifyContent: 'center' },
  presetText: { color: 'red', fontSize: 16, textAlign: 'center' },
 
  messageBubble: { maxWidth: '80%', padding: 10, borderRadius: 10, marginVertical: 5 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: 'red' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#1a1a1a' },
  messageText: { fontSize: 16 },
  userText: { color: '#fff' },
  botText: { color: '#fff' },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: 'transparent', // Update this line
    position: 'absolute', // Add this line
    bottom: 0, // Add this line
    left: 0, // Add this line
    right: 0, // Add this line
    marginBottom: Platform.OS === 'ios' ? 20 : 20,
  },
  messageContainer: {

    padding: 10,
    paddingBottom: 90, // Add this line to prevent messages from being hidden behind input
  },
  input: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 24, paddingHorizontal: 20, color: '#fff' , paddingVertical: 10,  },
  sendButton: { justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  headerLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  botIconSmall: {
    width: 30,
    height: 30,
    marginRight: 8,
    borderRadius: 15,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginLeft: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    marginHorizontal: 3,
  },
  videoContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  videoThumbnail: {
    width: 200,
    height: 120,
    borderRadius: 8,
  },
  playButton: {
    position: 'absolute',
    top: 40,
    left: 80,
  },
  videoTitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#000',
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    marginRight: 10,
  }
  
});
