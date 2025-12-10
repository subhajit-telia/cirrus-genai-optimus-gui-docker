import React, { useState } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonFooter,
  IonButton,
  IonContent,
  IonIcon,
  IonTextarea,
  IonPopover,
} from "@ionic/react";
import { informationCircleOutline, refreshOutline, star, starOutline } from "ionicons/icons";
import './FeedbackBox.css';

interface FeedbackModalProps {
  isOpen: boolean;
  selectedItem: {
    copy_version_id: string,
    rating: number,
    format_rating: number,
    accuracy_rating: number,
    language_rating: number,
    comment: string
  };
  onClose: () => void;
  onSave: (updatedItem: {
    copy_version_id: string,
    rating: number,
    format_rating: number,
    accuracy_rating: number,
    language_rating: number,
    comment: string
  }) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  selectedItem,
  onClose,
  onSave,
}) => {
  const [feedbackData, setFeedbackData] = React.useState({ ...selectedItem });
  const [hoveredRating, setHoveredRating] = useState<{
    format_rating: number | null;
    accuracy_rating: number | null;
    language_rating: number | null;
  }>({
    format_rating: null,
    accuracy_rating: null,
    language_rating: null,
  });

  React.useEffect(() => {
    console.log('selectedItem', selectedItem);
    if (selectedItem) {
      setFeedbackData({ ...selectedItem });
    }
  }, [selectedItem]);

  const handleRatingChange = (
    field: "format_rating" | "accuracy_rating" | "language_rating",
    value: number
  ) => {
    setFeedbackData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeedbackSave = () => {
    console.log('feedbackData', feedbackData)

    const averageRating =
    ((feedbackData.format_rating ?? 0) + (feedbackData.accuracy_rating ?? 0) + (feedbackData.language_rating ?? 0)) / 3;
    
    onSave({ ...feedbackData, rating: Math.round(averageRating)});
    onClose();
  };

  return (
    <IonModal className="feedback-box" isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-center font-bold text-lg">Copy Feedback</IonTitle>
        </IonToolbar>
      </IonHeader>
      <div>
        <h2 className="my-2.5 px-4 text-center">How well does this copy align with the requirements? Refine your rating here.</h2>
        <IonItem lines="none">
          <IonLabel className="!flex items-center flex-row-reverse justify-end">Format <IonIcon id="format-trigger" className="block ml-1.5 cursor-pointer" slot="icon-only" icon={informationCircleOutline}></IonIcon></IonLabel>
          <IonPopover className="rating-popover" size="auto" trigger="format-trigger" triggerAction="hover">
            <IonContent class="ion-padding">
              Ensures that the generated copy adheres to the specific structure and requirements outlined in the <b>Format Definition</b>.<br/>
              <b>Structure:</b> Verify that the copy follows the intended structural format, such as paragraph order, header presence, or specified sub-sections.<br/>
              <b>Length:</b> Check if the copy meets the character or word count limits set for each format (e.g., SMS, small email).<br/>
              <b>CTA (Optional):</b> If required by the format, ensure that the call to action placeholder is included.<br/>
              <b>Greeting Text (Optional):</b> If required by the format, confirm that the greeting text is correct.
            </IonContent>
          </IonPopover>
          <div style={{ display: "flex", gap: "5px" }}>
            {[1, 2, 3, 4, 5].map((starValue) => (
              <IonIcon
                key={starValue}
                icon={
                  starValue <= (hoveredRating.format_rating ?? feedbackData.format_rating ?? 0)
                    ? star
                    : starOutline
                }
                onMouseEnter={() =>
                  setHoveredRating({ ...hoveredRating, format_rating: starValue })
                }
                onMouseLeave={() =>
                  setHoveredRating({ ...hoveredRating, format_rating: null })
                }
                color="primary"
                onClick={() => handleRatingChange("format_rating", starValue)}
                style={{ cursor: "pointer", fontSize: "24px" }}
              />
            ))}
          </div>
        </IonItem>
        <IonItem lines="none">
          <IonLabel className="!flex items-center flex-row-reverse justify-end">Accuracy <IonIcon id="integrity-trigger" className="block ml-1.5 cursor-pointer" slot="icon-only" icon={informationCircleOutline}></IonIcon></IonLabel>
          <IonPopover className="rating-popover" size="auto" trigger="integrity-trigger" triggerAction="hover">
            <IonContent class="ion-padding">
              Ensures that the factual accuracy and truthfulness of the copy, especially when it references specific products or services.<br/>
              <b>Product Accuracy:</b> Validate that the copy accurately describes the product features, specifications, or offerings as per Telia’s real products and services.<br/>
              <b>Truth and Factuality:</b> Ensure that all statements in the copy are true, avoiding exaggerations, misrepresentations, or any information that could mislead the customer.
            </IonContent>
          </IonPopover>
          <div style={{ display: "flex", gap: "5px" }}>
            {[1, 2, 3, 4, 5].map((starValue) => (
              <IonIcon
                key={starValue}
                icon={
                  starValue <= (hoveredRating.accuracy_rating ?? feedbackData.accuracy_rating ?? 0)
                    ? star
                    : starOutline
                }
                onMouseEnter={() =>
                  setHoveredRating({ ...hoveredRating, accuracy_rating: starValue })
                }
                onMouseLeave={() =>
                  setHoveredRating({ ...hoveredRating, accuracy_rating: null })
                }
                color="primary"
                onClick={() => handleRatingChange("accuracy_rating", starValue)}
                style={{ cursor: "pointer", fontSize: "24px" }}
              />
            ))}
          </div>
        </IonItem>
        <IonItem lines="none">
          <IonLabel className="!flex items-center flex-row-reverse justify-end">Language <IonIcon id="communication-trigger" className="block ml-1.5 cursor-pointer" slot="icon-only" icon={informationCircleOutline}></IonIcon></IonLabel>
          <IonPopover className="rating-popover" size="auto" trigger="communication-trigger" triggerAction="hover">
            <IonContent class="ion-padding">
              Evaluates the tone, clarity, and relevance of the language, as well as its alignment with the <b>Purpose</b> and <b>Segment</b> definitions.<br/>
              <b>Tone:</b> Assess if the copy’s tone matches the general requirements (e.g., warm, savvy, straightforward) or if segment is selected, aligns with the segment and audience (B2B or B2C).<br/>
              <b>Language:</b> Verify that the language is clear, concise, and appropriately informal or formal depending on the purpose and audience (B2B or B2C).<br/>
              <b>Value Proposition:</b> Check if the copy clearly communicates the benefits and value of the product/service, addressing the specific needs and priorities of the target segment.<br/>
              <b>Actionability:</b> Ensure that the copy encourages the intended action (e.g., clicking a link, upgrading a service) and that the action is easy to understand and follow.
            </IonContent>
          </IonPopover>
          <div style={{ display: "flex", gap: "5px" }}>
            {[1, 2, 3, 4, 5].map((starValue) => (
              <IonIcon
                key={starValue}
                icon={
                  starValue <= (hoveredRating.language_rating ?? feedbackData.language_rating ?? 0)
                    ? star
                    : starOutline
                }
                onMouseEnter={() =>
                  setHoveredRating({ ...hoveredRating, language_rating: starValue })
                }
                onMouseLeave={() =>
                  setHoveredRating({ ...hoveredRating, language_rating: null })
                }
                color="primary"
                onClick={() => handleRatingChange("language_rating", starValue)}
                style={{ cursor: "pointer", fontSize: "24px" }}
              />
            ))}
          </div>
        </IonItem>
        <IonItem lines="none">
            <IonTextarea
                label="Comment"
                labelPlacement="floating"
                fill="outline"
                placeholder="Add your comment"
                value={feedbackData.comment || ""}
                onIonInput={(e) =>
                setFeedbackData((prev) => ({
                    ...prev,
                    comment: e.detail.value as string,
                }))
                }
            ></IonTextarea>
        </IonItem>
      </div>
      <IonFooter>
        <IonToolbar className="text-right px-4">
          <IonButton shape="round" onClick={handleFeedbackSave}>
            Submit
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default FeedbackModal;
