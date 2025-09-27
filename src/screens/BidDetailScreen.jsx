import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Animated,
  ToastAndroid,
  Platform,
  TextInput,
  Modal,
  PermissionsAndroid,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";


export default function BidDetailScreen({ route }) {
  const navigation = useNavigation();
  const { tender } = route.params || {};

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmedLsp, setConfirmedLsp] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const fadeAnimRefs = useRef([]);
  const [sortType, setSortType] = useState("price");
  

  // Confirmation
  const [remarksModalVisible, setRemarksModalVisible] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [confirmedBidDetails, setConfirmedBidDetails] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const [showPreview, setShowPreview] = useState(false);

  const isMounted = useRef(true);
  const [tableExpanded, setTableExpanded] = useState(true);
const [dropdownVisible, setDropdownVisible] = useState(false);


  useEffect(() => {
    isMounted.current = true;

    if (!tender || !tender.tenderNo || !tender.createdBy) {
      setTimeout(() => {
        if (isMounted.current) Alert.alert("Error", "Tender information is not available");
      }, 0);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
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
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        fadeAnimRefs.current = data.map(() => new Animated.Value(0));
        if (isMounted.current) setBids(data);

        const saved = await AsyncStorage.getItem(
          `remarks_${tender.tenderNo}`
        );
        if (saved) {
          const parsed = JSON.parse(saved);
          if (isMounted.current) {
            setConfirmedBidDetails(parsed);
            setConfirmedLsp(parsed.lspCompanyName);
          }
        }
     

        // fetch assignment to detect confirmed LSP
        const res = await fetch(
          `http://10.0.2.2:9090/3pl/assignments?companyName=${tender.createdBy}`
        );
        if (res.ok) {
          const assignments = await res.json();
          const tenderAssignment = assignments.find((a) => a.tenderNo === tender.tenderNo);
          if (tenderAssignment) {
            if (isMounted.current) setAssignment(tenderAssignment);
            if (isMounted.current) setConfirmedLsp(tenderAssignment.lspCompanyName || null);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setTimeout(() => {
          if (isMounted.current) Alert.alert("Error", "Failed to load bid data");
        }, 0);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [tender]);

  // Sorting (stable)
  const sortedBids = [...bids].sort((a, b) => {
    if (sortType === "price") {
      return (parseFloat(b.bidPrice) || 0) - (parseFloat(a.bidPrice) || 0);
    } else {
      const dateA = a.estimatedArrivalDate ? new Date(a.estimatedArrivalDate) : new Date(0);
      const dateB = b.estimatedArrivalDate ? new Date(b.estimatedArrivalDate) : new Date(0);
      return dateB - dateA;
    }
  });

  // Open confirm modal
  const openConfirmModal = (bid) => {
    setSelectedBid(bid);
    setRemarks("");
    setRemarksModalVisible(true);
  };

  // Confirm selected bid
  const handleConfirm = async () => {
  if (!selectedBid) return;
  if (!remarks.trim()) {
    Alert.alert("Required", "Please enter remarks to confirm the bid.");
    return;
  }

  try {
     const dataToSave = {
        lspCompanyName: selectedBid.lspCompanyName,
        remarks,
        price: selectedBid.bidPrice,
        eta: selectedBid.estimatedArrivalDate,
      };
      await AsyncStorage.setItem(
        `remarks_${tender.tenderNo}`,
        JSON.stringify(dataToSave)
      );
    const response = await fetch("http://10.0.2.2:9090/3pl/confirm-lsp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenderNo: tender.tenderNo,
        lspCompanyName: selectedBid.lspCompanyName,
        remarks: remarks,
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    // Update local bids list
    const updated = bids.map((b) =>
      b.lspCompanyName === selectedBid.lspCompanyName ? { ...b, remarks } : b
    );
    setBids(updated);

    // Store confirmed LSP + remarks in dedicated state
    setConfirmedLsp(selectedBid.lspCompanyName);
    setConfirmedBidDetails({
      lspCompanyName: selectedBid.lspCompanyName,
      remarks,
      price: selectedBid.price,
      eta: selectedBid.eta,
    });

    if (Platform.OS === "android") {
      ToastAndroid.show("Bid confirmed successfully!", ToastAndroid.SHORT);
    } else {
      setTimeout(() => Alert.alert("Confirmed", "Bid confirmed successfully!"), 0);
    }

    setRemarksModalVisible(false);
    setSelectedBid(null);
    setRemarks("");
  } catch (error) {
    console.error("Error confirming bid:", error);
    setTimeout(() => {
      if (isMounted.current) Alert.alert("Error", "Failed to confirm bid. Please try again.");
    }, 0);
  }
};

  // Download CSV
  const handleDownload = async () => {
    try {
      if (!sortedBids.length) {
        return Alert.alert("No Data", "There are no bids to export.");
      }

      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "App needs access to your storage to save CSV file",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return Alert.alert("Permission Denied", "Cannot save CSV without permission.");
        }
      }

      const header = "LSP Name,Bid Price,ETA,Message,Remarks,Status\n";
      const rows = sortedBids
        .map((b) => {
          const isConfirmed = confirmedLsp === b.lspCompanyName;
          const status = !confirmedLsp ? "Pending" : isConfirmed ? "Confirmed" : "Not Confirmed";
          const bidRemarks = isConfirmed ? (b.remarks || "") : "";
          return `${b.lspCompanyName || "N/A"},${b.bidPrice || "N/A"},${b.estimatedArrivalDate || "N/A"},${b.lspMessage || "N/A"},${bidRemarks},${status}`;
        })
        .join("\n");
      const csv = header + rows;

      const fileName = `bids_${tender.tenderNo}.csv`;
      const path =
        Platform.OS === "android"
          ? `${RNFS.DownloadDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.writeFile(path, csv, "utf8");

      await Share.open({
        url: `file://${path}`,
        type: "text/csv",
        filename: fileName,
        failOnCancel: false,
      });

      if (Platform.OS === "android") {
        ToastAndroid.show("CSV saved & ready to share!", ToastAndroid.SHORT);
      }
    } catch (err) {
      console.error("Download error:", err);
      Alert.alert("Error", "Failed to download or share bids.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1D3557" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Bid Details for {tender?.tenderNo}</Text>
      </View>

      {/* Sorting Dropdown */}
<View style={styles.sortContainer}>
  <TouchableOpacity
    style={styles.dropdownButton}
    onPress={() => setDropdownVisible((prev) => !prev)}
    activeOpacity={0.8}
  >
    <Text style={styles.dropdownButtonText}>
      Sort by: {sortType === "price" ? "Price" : "ETA"}
    </Text>
    <Icon name={dropdownVisible ? "expand-less" : "expand-more"} size={20} color="#fff" />
  </TouchableOpacity>

  {dropdownVisible && (
    <View style={styles.dropdownMenu}>
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => {
          setSortType("price");
          setDropdownVisible(false);
        }}
      >
        <Text style={styles.dropdownItemText}>Price</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => {
          setSortType("eta");
          setDropdownVisible(false);
        }}
      >
        <Text style={styles.dropdownItemText}>ETA</Text>
      </TouchableOpacity>
    </View>
  )}
</View>


      {/* Download + Preview */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload} activeOpacity={0.8}>
          <Text style={styles.downloadText}>⬇️ Download CSV</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.downloadButton, { backgroundColor: "#6c757d" }]}
          onPress={() => setShowPreview((v) => !v)}
          activeOpacity={0.8}
        >
          <Text style={styles.downloadText}>{showPreview ? "Hide Preview" : "Preview CSV"}</Text>
        </TouchableOpacity>
      </View>

      {/* CSV Preview */}
      {showPreview && (
        <ScrollView horizontal style={styles.previewTable}>
          <View>
            <View style={[styles.row, styles.tableHeader]}>
              <Text style={[styles.cell, styles.headerCell, { minWidth: 120 }]}>LSP</Text>
              <Text style={[styles.cell, styles.headerCell, { minWidth: 80 }]}>Price</Text>
              <Text style={[styles.cell, styles.headerCell, { minWidth: 120 }]}>ETA</Text>
              <Text style={[styles.cell, styles.headerCell, { minWidth: 200 }]}>Message</Text>
            </View>

            {sortedBids.map((b, i) => (
              <View key={i} style={styles.row}>
                <Text style={[styles.cell, { minWidth: 120 }]}>{b.lspCompanyName || "N/A"}</Text>
                <Text style={[styles.cell, { minWidth: 80 }]}>{b.bidPrice || "N/A"}</Text>
                <Text style={[styles.cell, { minWidth: 120 }]}>{b.estimatedArrivalDate || "N/A"}</Text>
                <Text style={[styles.cell, { minWidth: 200 }]}>{b.lspMessage || "N/A"}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
{/* Bid Table */}
<ScrollView style={{ flex: 1 }}>
  <ScrollView horizontal style={styles.tableContainer}>
    <View style={styles.table}>
      <View style={[styles.row, styles.tableHeader]}>
        <Text style={[styles.cell, styles.headerCell, { minWidth: 150 }]}>LSP Name</Text>
        <Text style={[styles.cell, styles.headerCell, { minWidth: 100 }]}>Bid Price</Text>
        <Text style={[styles.cell, styles.headerCell, { minWidth: 150 }]}>ETA</Text>
        <Text style={[styles.cell, styles.headerCell, { minWidth: 200 }]}>Message</Text>
        <Text style={[styles.cell, styles.headerCell, { minWidth: 130 }]}>Action</Text>

        {/* Expand/Collapse Icon */}
        <TouchableOpacity
          style={[styles.cell, { minWidth: 60, alignItems: "center" }]}
          onPress={() => setTableExpanded((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Icon
            name={tableExpanded ? "expand-less" : "expand-more"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Table Rows toggle with expand/collapse */}
      {tableExpanded &&
        sortedBids.map((item, index) => {
          const isConfirmed = confirmedLsp === item.lspCompanyName;

          return (
            <View
              key={index}
              style={[
                styles.row,
                { backgroundColor: index % 2 === 0 ? "#fff" : "#f1f5fb" },
              ]}
            >
              <Text style={[styles.cell, { minWidth: 150 }]}>{item.lspCompanyName}</Text>
              <Text style={[styles.cell, { minWidth: 100 }]}>
                {item.bidPrice ? `₹${item.bidPrice}` : "N/A"}
              </Text>
              <Text style={[styles.cell, { minWidth: 150 }]}>
                {item.estimatedArrivalDate || "N/A"}
              </Text>
              <Text style={[styles.cell, { minWidth: 200 }]}>
                {item.lspMessage || "N/A"}
              </Text>

              <View style={[styles.cell, { minWidth: 130 }]}>
                {confirmedLsp ? (
                  <View
                    style={[
                      styles.statusBox,
                      { backgroundColor: isConfirmed ? "#49f791" : "#f57a6d" },
                    ]}
                  >
                    <Text style={styles.buttonText}>
                      {isConfirmed ? "Confirmed" : "Not Confirmed"}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => openConfirmModal(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>Confirm</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
    </View>
  </ScrollView>
</ScrollView>



      {/* Confirmed Bid Section */}
   {confirmedBidDetails && (
  <View style={styles.confirmedCard}>
    <Text style={styles.confirmedTitle}>✅ Confirmed Bid</Text>

    <View style={styles.confirmedRow}>
      <Text style={styles.confirmedLabel}>LSP:</Text>
      <Text style={styles.confirmedValue}>{confirmedBidDetails.lspCompanyName || "N/A"}</Text>
    </View>

    {/* <View style={styles.confirmedRow}>
      <Text style={styles.confirmedLabel}>Price:</Text>
      <Text style={styles.confirmedValue}>{confirmedBidDetails.bidPrice ? `₹${confirmedBidDetails.bidPrice}` : "N/A"}</Text>
    </View>

    <View style={styles.confirmedRow}>
      <Text style={styles.confirmedLabel}>ETA:</Text>
      <Text style={styles.confirmedValue}>{confirmedBidDetails.estimatedArrivalDate || "N/A"}</Text>
    </View> */}

    <View style={{ marginTop: 6 }}>
      <Text style={[styles.confirmedLabel, { width: "100%", marginBottom: 4 }]}>Remarks :</Text>
      <Text style={styles.mutedText}>{confirmedBidDetails.remarks || "No remarks provided."}</Text>
    </View>
  </View>
)}

      {/* Assigned Transporter Section */}
      {assignment && (
        <View style={styles.assignmentCard}>
          <Text style={styles.assignmentTitle}>🚛 Assigned Driver & Vehicle details </Text>

          <Text style={styles.assignmentText}>
            <Text style={styles.assignmentLabel}>Vehicle: </Text>
            {assignment.vehicleNumber || "N/A"}
          </Text>

          <Text style={styles.assignmentText}>
            <Text style={styles.assignmentLabel}>Driver: </Text>
            {assignment.driverName || "N/A"}
          </Text>

          <Text style={styles.assignmentText}>
            <Text style={styles.assignmentLabel}>Contact: </Text>
            {assignment.driverContact || "N/A"}
          </Text>

          <Text style={styles.assignmentText}>
            <Text style={styles.assignmentLabel}>DL Number: </Text>
            {assignment.dlNumber || "N/A"}
          </Text>
        </View>
      )}

      {/* Remarks Modal */}
      <Modal
        visible={remarksModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRemarksModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
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
              <TouchableOpacity
                style={[styles.confirmButton, { flex: 1, marginRight: 6 }]}
                onPress={handleConfirm}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusBox, { flex: 1, backgroundColor: "#ccc" }]}
                onPress={() => {
                  setRemarksModalVisible(false);
                  setSelectedBid(null);
                  setRemarks("");
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: "#1D3557", paddingVertical: 20, alignItems: "center" },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 16 },
  tableContainer: { margin: 18, borderRadius: 10, backgroundColor: "#fff" },
  table: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, overflow: "hidden" },
  tableHeader: { backgroundColor: "#457B9D" },
  row: { flexDirection: "row", alignItems: "center" },
  cell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    textAlignVertical: "center",
  },
  headerCell: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  confirmButton: {
    backgroundColor: "#1D3557",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  statusBox: {
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  noData: { textAlign: "center", marginTop: 20, fontSize: 16, color: "gray" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  downloadButton: {
    backgroundColor: "#1D3557",
    marginVertical: 16,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  downloadText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  previewTable: { marginHorizontal: 16, marginBottom: 10, borderRadius: 6, borderWidth: 1, borderColor: "#ddd" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  modalContainer: { backgroundColor: "white", borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  sortContainer: { flexDirection: "row", justifyContent: "flex-end", marginRight: 16, marginTop: 16 },
  sortButton: { flexDirection: "row" },
  gradientButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  sortText: { color: "#fff", marginLeft: 16, fontWeight: "bold" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 16 },
  assignmentCard: {
    margin: 18,
    padding: 18,
    borderRadius: 8,
    backgroundColor: "#f9fafc",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#5377b4ff",
  },
 
  confirmedCard: {
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d0deedff",
    shadowColor: "#000",
    borderWidth: 1,
    // shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  confirmedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f2b45", 
    marginBottom: 8,
  },


  assignmentCard: {
    margin: 18,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f8fbff",
    borderWidth: 1,
    borderColor: "#101113ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  expandContainer: {
  marginHorizontal: 16,
  marginVertical: 10,
  alignItems: "flex-end",
},
expandButton: {
  backgroundColor: "#1D3557",
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 6,
},
expandText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 14,
},
dropdownButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#1D3557",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 6,
  minWidth: 140,
},
dropdownButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 14,
},
dropdownMenu: {
  position: "absolute",
  top: 45,
  right: 0,
  backgroundColor: "#fff",
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "#ddd",
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  zIndex: 1000,
},
dropdownItem: {
  paddingVertical: 10,
  paddingHorizontal: 16,
},
dropdownItemText: {
  fontSize: 14,
  color: "#333",
},

  
 

});
