(ns app.frontend.survey.views
  (:require [reagent.core  :as r]
            [re-frame.core :as re-frame]
            [app.frontend.survey.subs :as subs]
            [app.frontend.survey.events :as survey-events]
            ["/pages/landing-page$default" :as survey-js]))

(def survey (r/adapt-react-class survey-js))

(defn app []
  (let [loading? (re-frame/subscribe [::subs/loading?])]
    (fn []
      (if @loading?
        [:div "Loading survey..."]
        [:<>
         [survey {:id "survey"
                  :isLoading false
                  :questions @(re-frame/subscribe [::subs/questions])
                  :currentQuestion @(re-frame/subscribe [::subs/current-question-index])
                  :currentQuestionResponse @(re-frame/subscribe [::subs/current-question-response])
                  :showEmailForm @(re-frame/subscribe [::subs/show-email-form])
                  :handleAnswer #(re-frame/dispatch [::survey-events/answer-question %])
                  :handleNext #(re-frame/dispatch [::survey-events/next-question])
                  :handlePrevious #(re-frame/dispatch [::survey-events/previous-question])
                  :isEmailFormPending @(re-frame/subscribe [::subs/email-form-pending])
                  :email @(re-frame/subscribe [::subs/form :email])
                  :onChangeEmail #(re-frame/dispatch [::survey-events/update-email-form :email (-> % .-target .-value)])
                  :handleSubmit #(re-frame/dispatch [::survey-events/save-survey])}]]))))