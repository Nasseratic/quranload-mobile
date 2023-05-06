import React, { FunctionComponent } from "react";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { StyleSheet, View } from "react-native";
import Typography from "components/Typography";
import { Image } from "expo-image";

const BLURHASH = "U6PZfSi_.AyE_3t7t7R**0o#DgR4_3R*D%xt";

interface Props {
  lecture?: Frontend.Content.Lecture;
}

const LectureBox: FunctionComponent<Props> = ({ lecture }) => {
  React;
  return (
    <View style={{ ...styles.container }}>
      <View style={styles.lecture}>
        <View style={styles.institutionImageContainer}>
          <Image
            style={styles.institutionImage}
            contentFit="contain"
            source="https://s3-alpha-sig.figma.com/img/3569/704f/4eadebbdb061c627ee3560b99fccffcc?Expires=1684108800&Signature=kWeltpIz8rXtqGjmlmtXM6YT287tuDwqUhxAolPLMajP5iNP2566ZIMk1PcdGw80M80-oi4PG3kr8~lWTUifYcH4GYQxSqp2C36P81vRKp-05nM4V1CySHDWRYXfaiPrqO6rTS-fR7es5X6I9IPBwYxkPleufxL~Gi5dzHfhki0d~qEfJ2xeNsAOfin6aSWvT~E8Eumi7pbFbCW1QlliKtS2yfg9mIlbGc3bqFUIgZf1WbR-ybLqIxXq-M0AGi50TSsaJGU5GLQIKo04BuqmZFmo5KK0z2oJIHRE3k0Afo3QjAGkgD0ADyIdo739LqdgJDfY~Hd4LQXRAex17cs6~A__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4"
            placeholder={BLURHASH}
          />
        </View>
        <View style={styles.lectureDetails}>
          <Typography type="SubHeaderHeavy" style={{ color: Colors.Primary[1] }}>
            Niveau 2 - Læsning
          </Typography>
          <Typography type="CaptionLight" style={{ color: Colors.Black[2] }}>
            Imam Malik Institutet
          </Typography>
        </View>
        <View style={styles.lectureMissingAssignments}>
          <Typography type="SmallHeavy" style={{ color: Colors.White[1] }}>
            3
          </Typography>
        </View>
      </View>
      <View style={styles.assignment}>
        <Typography type="BodyLight">Read: 100-101</Typography>
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
  institutionImageContainer: {
    width: 45,
    height: 45,
  },
  institutionImage: {
    flex: 1,
    width: "100%",
  },
  lectureDetails: {
    flex: 1,
    flexDirection: "column",
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
