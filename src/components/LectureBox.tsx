import React, { FunctionComponent } from "react";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { StyleSheet, Text, View } from "react-native";
import Typographies from "styles/Typographies";

interface Props {
  lecture?: Frontend.Content.Lecture;
}

const LectureBox: FunctionComponent<Props> = ({ lecture }) => {
  React;
  return (
    <View style={{ ...styles.container }}>
      <View style={styles.lecture}>
        <View style={styles.institutionImage}></View>
        <View style={styles.lectureDetails}>
          <Text style={styles.lectureTitle}>Niveau 2 - Læsning</Text>
          <Text style={styles.lectureInstitution}>Imam Malik Institutet</Text>
        </View>
        <View style={styles.lectureMissingAssignments}>
          <Text style={{ ...Typographies.small.heavy, color: Colors.White[1] }}>3</Text>
        </View>
      </View>
      <View style={styles.assignment}>
        <Text>Read: 100-101</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    borderRadius: GeneralConstants.BorderRadius.default,
    borderWidth: 1,
    borderColor: Colors.Gray[1],
  },
  lecture: {
    padding: GeneralConstants.Spacing.lg,
    flexDirection: "row",
    gap: GeneralConstants.Spacing.sm,
    alignItems: "center",
  },
  institutionImage: {
    width: 45,
    height: 45,
    backgroundColor: Colors.Primary[1],
  },
  lectureDetails: {
    flex: 1,
    flexDirection: "column",
  },
  lectureTitle: {
    color: Colors.Primary[1],
    ...Typographies.subheader.heavy,
  },
  lectureInstitution: {
    color: Colors.Black[2],
    ...Typographies.caption.light,
  },
  lectureMissingAssignments: {
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
    backgroundColor: Colors.Error[1],
    borderRadius: GeneralConstants.BorderRadius.default,
  },
  assignment: {
    borderTopWidth: 1,
    borderTopColor: Colors.Gray[1],
    paddingVertical: GeneralConstants.Spacing.sm,
    paddingHorizontal: GeneralConstants.Spacing.lg,
    flexDirection: "row",
    gap: GeneralConstants.Spacing.sm,
    alignItems: "center",
  },
});

export default LectureBox;
