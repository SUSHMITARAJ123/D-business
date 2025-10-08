import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

const COLORS = {
  primary: "#1D3557",
  secondary: "#457B9D",
  lightGray: "#f9f9f9",
  green: "#49f791",
  red: "#f57a6d",
  border: "#e0e0e0",
  cardBg: "#fff",
  buttonText: "#fff",
  headerBg: "#1D3557",
  headerText: "#fff",
};

export default function BidDetailScreen({ route }) {
  const navigation = useNavigation();
  const { tender } = route.params || {};
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmedLsp, setConfirmedLsp] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [sortType, setSortType] = useState("price");
  const [actionsDropdownVisible, setActionsDropdownVisible] = useState(false);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [tableExpanded, setTableExpanded] = useState(true);
  const [remarksModalVisible, setRemarksModalVisible] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [confirmedBidDetails, setConfirmedBidDetails] = useState(null);

  const isMounted = useRef(true);

  // Fetch bids and assignments
  useEffect(() => {
    isMounted.current = true;

    if (!tender?.tenderNo || !tender?.createdBy) {
      Alert.alert("Error", "Tender information is missing.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch bids
        const response = await fetch(
          "http://10.0.2.2:9090/api/lsp/responses/filter-by-tender",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: tender.createdBy,
              tender_no: tender.tenderNo,
            }),
          }
        );
        if (!response.ok) throw new Error("Failed to fetch bids");
        const data = await response.json();
        if (isMounted.current) setBids(data);

        // Load confirmed bid from AsyncStorage
        const saved = await AsyncStorage.getItem(`remarks_${tender.tenderNo}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (isMounted.current) {
            setConfirmedBidDetails(parsed);
            setConfirmedLsp(parsed.lspCompanyName);
          }
        }

        // Fetch assignments
        const res = await fetch(
          `http://10.0.2.2:9090/3pl/assignments?companyName=${tender.createdBy}`
        );
        if (res.ok) {
          const assignments = await res.json();
          const tenderAssignment = assignments.find(a => a.tenderNo === tender.tenderNo);
          if (tenderAssignment && isMounted.current) setAssignment(tenderAssignment);
          if (tenderAssignment && isMounted.current)
            setConfirmedLsp(tenderAssignment.lspCompanyName || null);
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load bids.");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchData();
    return () => (isMounted.current = false);
  }, [tender]);

  // Sort bids
  const sortedBids = [...bids].sort((a, b) => {
    if (sortType === "price") return (parseFloat(a.bidPrice) || 0) - (parseFloat(b.bidPrice) || 0);
    const dateA = new Date(a.estimatedArrivalDate || 0);
    const dateB = new Date(b.estimatedArrivalDate || 0);
    return dateA - dateB;
  });

  const openConfirmModal = bid => {
    setSelectedBid(bid);
    setRemarks("");
    setRemarksModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!selectedBid || !remarks.trim()) {
      return Alert.alert("Required", "Please enter remarks.");
    }
    try {
      const dataToSave = {
        lspCompanyName: selectedBid.lspCompanyName,
        remarks,
        price: selectedBid.bidPrice,
        eta: selectedBid.estimatedArrivalDate,
      };
      await AsyncStorage.setItem(`remarks_${tender.tenderNo}`, JSON.stringify(dataToSave));

      await fetch("http://10.0.2.2:9090/3pl/confirm-lsp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderNo: tender.tenderNo,
          lspCompanyName: selectedBid.lspCompanyName,
          remarks,
        }),
      });

      setConfirmedLsp(selectedBid.lspCompanyName);
      setConfirmedBidDetails(dataToSave);
      setRemarksModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to confirm bid.");
    }
  };

  const handleDownload = async (mode = "share") => {
    try {
      if (!sortedBids.length) return Alert.alert("No Data", "No bids to export.");

      const header = "LSP Name,Bid Price,ETA,Message,Remarks,Status\n";
      const rows = sortedBids
        .map(b => {
          const isConfirmed = confirmedLsp === b.lspCompanyName;
          const status = !confirmedLsp ? "Pending" : isConfirmed ? "Confirmed" : "Not Confirmed";
          return `${b.lspCompanyName},${b.bidPrice},${b.estimatedArrivalDate},${b.lspMessage || ""},${isConfirmed ? b.remarks : ""},${status}`;
        })
        .join("\n");

      const fileName = `bids_${tender.tenderNo}.csv`;
      let path =
        mode === "downloads" && Platform.OS === "android"
          ? `${RNFS.DownloadDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      if (Platform.OS === "android" && mode === "downloads") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return Alert.alert("Permission Denied", "Cannot save file to Downloads.");
        }
      }

      await RNFS.writeFile(path, header + rows, "utf8");
      const exists = await RNFS.exists(path);
      if (!exists) return Alert.alert("Error", "File not created");

      if (mode === "share") {
        await Share.open({
          url: Platform.OS === "android" ? `file://${path}` : path,
          type: "text/csv",
          filename: fileName,
        });
        Alert.alert("Success", "CSV ready to share!");
      } else {
        Alert.alert("Success", "CSV saved to Downloads!");
      }
    } catch (err) {
      console.error("CSV export error:", err);
      Alert.alert("Error", "Failed to export CSV.");
    }
  };

  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  const renderBidRow = ({ item, index }) => {
    const isConfirmed = confirmedLsp === item.lspCompanyName;
    const canConfirm = !confirmedLsp && bids.length > 0;

    return (
      <View
        style={[
          styles.row,
          { backgroundColor: index % 2 === 0 ? "#fff" : COLORS.lightGray },
        ]}
      >
        <Text style={[styles.cell, { minWidth: 150 }]}>{item.lspCompanyName}</Text>
        <Text style={[styles.cell, { minWidth: 100 }]}>
          {item.bidPrice ? `₹${item.bidPrice}` : "N/A"}
        </Text>
        <Text style={[styles.cell, { minWidth: 150 }]}>
          {item.estimatedArrivalDate || "N/A"}
        </Text>
        <Text style={[styles.cell, { minWidth: 200 }]}>{item.lspMessage || "N/A"}</Text>
        <View style={[styles.cell, { minWidth: 130 }]}>
          {canConfirm && item.bidPrice ? (
            <TouchableOpacity
              disabled={isConfirmed}
              style={[
                styles.confirmButton,
                { backgroundColor: isConfirmed ? COLORS.green : COLORS.primary },
              ]}
              onPress={() => openConfirmModal(item)}
            >
              <Text style={styles.buttonText}>
                {isConfirmed ? "Confirmed" : "Confirm"}
              </Text>
            </TouchableOpacity>
          ) : isConfirmed ? (
            <View style={[styles.statusBox, { backgroundColor: COLORS.green }]}>
              <Text style={styles.buttonText}>Confirmed</Text>
            </View>
          ) : (
            <Text style={{ color: "#555", fontStyle: "italic" }}>Not Confirmed</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Bid Details - {tender.tenderNo}</Text>
      </View>

      {/* Actions & Sort */}
      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={styles.actionsButton}
          onPress={() => setActionsDropdownVisible(prev => !prev)}
        >
          <Text style={styles.buttonText}>CSV Actions ⬇️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortDropdownVisible(prev => !prev)}
        >
          <Text style={styles.buttonText}>Sort: {sortType === "price" ? "Price" : "ETA"}</Text>
          <Icon name={sortDropdownVisible ? "expand-less" : "expand-more"} size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Dropdowns */}
      {actionsDropdownVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { handleDownload("share"); setActionsDropdownVisible(false); }}
          >
            <Text>Share CSV</Text>
          </TouchableOpacity>
          {Platform.OS === "android" && (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => { handleDownload("downloads"); setActionsDropdownVisible(false); }}
            >
              <Text>Save to Downloads</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {sortDropdownVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => { setSortType("price"); setSortDropdownVisible(false); }}>
            <Text>Price</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => { setSortType("eta"); setSortDropdownVisible(false); }}>
            <Text>ETA</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Expand/Collapse */}
      <TouchableOpacity style={styles.expandButton} onPress={() => setTableExpanded(prev => !prev)}>
        <Text style={styles.expandButtonText}>{tableExpanded ? "⬆️ Collapse Bids" : "⬇️ Expand Bids"}</Text>
      </TouchableOpacity>

      {/* Bid Table */}
      {tableExpanded && (
        <View style={styles.tableWrapper}>
          <ScrollView horizontal>
            <View>
              <View style={[styles.row, styles.tableHeader]}>
                <Text style={[styles.cell, styles.headerCell, { minWidth: 150 }]}>LSP Name</Text>
                <Text style={[styles.cell, styles.headerCell, { minWidth: 100 }]}>Price</Text>
                <Text style={[styles.cell, styles.headerCell, { minWidth: 150 }]}>ETA</Text>
                <Text style={[styles.cell, styles.headerCell, { minWidth: 200 }]}>Message</Text>
                <Text style={[styles.cell, styles.headerCell, { minWidth: 130 }]}>Action</Text>
              </View>
              <FlatList
                data={sortedBids}
                renderItem={renderBidRow}
                keyExtractor={(item, idx) => idx.toString()}
                style={{ maxHeight: 350 }}
                nestedScrollEnabled={true}
              />
            </View>
          </ScrollView>
        </View>
      )}

      {/* Confirmed Bid */}
      {confirmedBidDetails && (
        <View style={styles.confirmedCard}>
          <Text style={styles.confirmedTitle}>✅ Confirmed Bid</Text>
          <Text>LSP: {confirmedBidDetails.lspCompanyName}</Text>
          <Text>Price: ₹{confirmedBidDetails.price}</Text>
          <Text>ETA: {confirmedBidDetails.eta}</Text>
          <Text>Remarks: {confirmedBidDetails.remarks}</Text>
        </View>
      )}

      {/* Assignment */}
      {assignment && (
        <View style={styles.assignmentCard}>
          <Text style={styles.assignmentTitle}>🚛 Assigned Driver & Vehicle</Text>
          <Text>Vehicle: {assignment.vehicleNumber}</Text>
          <Text>Driver: {assignment.driverName}</Text>
          <Text>Contact: {assignment.driverContact}</Text>
          <Text>DL Number: {assignment.dlNumber}</Text>
        </View>
      )}

      {/* Remarks Modal */}
      <Modal visible={remarksModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Remarks</Text>
            <TextInput
              style={styles.input}
              placeholder="Reason for accepting this bid"
              value={remarks}
              onChangeText={setRemarks}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.confirmButton, { flex: 1, marginRight: 6 }]} onPress={handleConfirm}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.statusBox, { flex: 1, backgroundColor: "#ccc" }]} onPress={() => setRemarksModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },

  header: {
    backgroundColor: COLORS.headerBg,
    paddingVertical: 24,
    alignItems: "center",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 12,
  },
  headerText: { color: COLORS.headerText, fontSize: 20, fontWeight: "bold" },

  actionsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  actionsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  sortButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginLeft: 8,
  },

  dropdownMenu: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    paddingVertical: 8,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 16 },

  tableWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tableHeader: { backgroundColor: COLORS.secondary },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 8 },
  cell: { paddingHorizontal: 8, fontSize: 14, flexShrink: 1, textAlign: "center" },
  headerCell: { color: "#fff", fontWeight: "bold", textAlign: "center" },

  confirmButton: { backgroundColor: COLORS.primary, paddingVertical: 6, borderRadius: 8, alignItems: "center" },
  statusBox: { borderRadius: 8, paddingVertical: 6, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },

  confirmedCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#eaf9f1",
    borderWidth: 1,
    borderColor: "#cde6d8",
    marginBottom: 12,
  },
  confirmedTitle: { fontWeight: "700", fontSize: 16, marginBottom: 8, color: COLORS.green },

  assignmentCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f3f6ff",
    borderWidth: 1,
    borderColor: "#d0d8ff",
    marginBottom: 12,
  },
  assignmentTitle: { fontWeight: "700", fontSize: 16, marginBottom: 6, color: COLORS.secondary },

  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: 16 },
  modalContainer: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 20 },
  modalTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, minHeight: 80, textAlignVertical: "top", marginBottom: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },

  expandButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginVertical: 8,
  },
  expandButtonText: {
    color: COLORS.buttonText,
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
});
