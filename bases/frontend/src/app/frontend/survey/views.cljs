(ns app.frontend.survey.views
  (:require [reagent.core  :as r]
            [re-frame.core :as re-frame]
            [app.frontend.survey.subs :as subs]
            [app.frontend.survey.events :as events]
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
                  :currentStep @(re-frame/subscribe [::subs/current-step])
                  :showEmailForm @(re-frame/subscribe [::subs/show-email-form])
                  :handleAnswer #(re-frame/dispatch [::events/answer-question %])
                  :handleNext #(re-frame/dispatch [::events/next-question])
                  :handlePrevious #(re-frame/dispatch [::events/previous-question])
                  :isEmailFormPending @(re-frame/subscribe [::subs/email-form-pending])
                  :email @(re-frame/subscribe [::subs/form :email])
                  :name @(re-frame/subscribe [::subs/form :name])
                  :company @(re-frame/subscribe [::subs/form :company])
                  :phone @(re-frame/subscribe [::subs/form :phone])
                  :onChangeEmail #(re-frame/dispatch [::events/update-field :email (-> % .-target .-value)])
                  :onChangeName #(re-frame/dispatch [::events/update-field :name (-> % .-target .-value)])
                  :onChangeCompany #(re-frame/dispatch [::events/update-field :company (-> % .-target .-value)])
                  :onChangePhone #(re-frame/dispatch [::events/update-field :phone (-> % .-target .-value)])
                  :handleSubmit #(re-frame/dispatch [::events/save-survey])}]]))))