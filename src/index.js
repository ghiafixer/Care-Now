'use strict';

const _ = require('lodash');
const Alexa = require('alexa-sdk');
const languageStrings = require('./languageStrings');

const APP_ID = 'amzn1.ask.skill.c35319a6-fc3e-4562-a76e-acadb11577b6';

const states = {
    START_MODE: '_STARTMODE',
    CONNECT_MODE: '_CONNECTMODE',
};

exports.handler = function(event, context, callback) {
    let alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID;
    alexa.resources = languageStrings;
    alexa.registerHandlers(
        newSessionHandlers,
        startModeHandlers,
        connectModeHandlers);
    alexa.execute();
};

let newSessionHandlers = {
    'NewSession': function() {
        console.log('Intent got: NewSession');
        helper.speakWelcomeResponse(this);
    },
    'Unhandled': function() {
        helper.speakUnhandledResponse(this);
    },
};

let startModeHandlers = Alexa.CreateStateHandler(states.START_MODE, {
    'SuggestionIntent': function() {
        const suggestion = _.get(this, 'event.request.intent.slots.suggestion.value', 'prescription');

        this.attributes.speechOutput = this.t("PRESCRIPTION_ASK", suggestion);
        this.attributes.repromptSpeech = this.t("PRESCRIPTION_REPROMPT", suggestion);

        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'ReasonIntent': function() {
        this.attributes.speechOutput = this.t("EXPLANATION_ASK");
        this.attributes.repromptSpeech = this.t("EXPLANATION_REPROMPT");

        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'CostIntent': function() {
        this.handler.state = states.CONNECT_MODE;
        this.attributes.speechOutput = this.t("VIRTUAL_VISIT_COST_ASK");
        this.attributes.repromptSpeech = this.t("VIRTUAL_VISIT_COST_REPROMPT");

        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.StartOverIntent': function() {
        this.attributes.speechOutput = this.t("WELCOME_ASK");
        this.attributes.repromptSpeech = this.t("WELCOME_REPROMPT");

        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.RepeatIntent': function() {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.HelpIntent': function() {
        helper.speakHelpResponse(this);
    },
    'AMAZON.StopIntent': function() {
        helper.speakExitResponse(this);
    },
    'AMAZON.CancelIntent': function() {
        helper.speakExitResponse(this);
    },
    'Unhandled': function() {
        helper.speakUnhandledResponse(this);
    },
    'SessionEndedRequest' : function () {
        helper.speakExitResponse(this);
    },
});

let connectModeHandlers = Alexa.CreateStateHandler(states.CONNECT_MODE, {
    'AMAZON.YesIntent': function() {
        console.log('Intent got: AMAZON.YesIntent');
        const url = 'https://www.carolinashealthcare.org/Campaigns/PrimaryCare/VirtualVisit/VirtualVisit';
        this.emit(':tellWithCard', this.t("EXIT_TELL"), 'Virtual Visit', url);
    },
    'AMAZON.NoIntent': function() {
        console.log('Intent got: AMAZON.NoIntent');
        helper.speakExitResponse(this);
    },
    'Unhandled': function() {
        helper.speakUnhandledResponse(this);
    },
});

var helper = {
    speakWelcomeResponse: function(context) {
        context.handler.state = states.START_MODE;

        if (context.event.request.intent) {
            context.emitWithState(context.event.request.intent.name);
            return;
        }

        context.attributes.speechOutput = context.t("WELCOME_ASK");
        context.attributes.repromptSpeech = context.t("WELCOME_REPROMPT");
        context.emit(':ask', context.attributes.speechOutput, context.attributes.repromptSpeech);
    },
    speakUnhandledResponse: function (context) {
        context.attributes.speechOutput = context.t("UNHANDLED_ASK");
        context.attributes.repromptSpeech = context.t("UNHANDLED_REPROMPT");

        context.emit(':ask', context.attributes.speechOutput, context.attributes.repromptSpeech);
    },
    speakServerError: function (context) {
        context.emit(':tell', context.t("COMMUNICATION_ISSUES_TELL"));
    },
    speakHelpResponse: function(context) {
        context.attributes.speechOutput = context.t("HELP_ASK");
        context.attributes.repromptSpeech = context.t("HELP_REPROMPT");

        context.emit(':ask', context.attributes.speechOutput, context.attributes.repromptSpeech);
    },
    speakExitResponse: function (context) {
        context.emit(':tell', context.t("EXIT_TELL"));
    },
};
