/**
 * TODOs:
 * - fire events (play, pause, loaded)
 * - add helper method to create audio dom elements
 *
 * @type {Class}
 * @version 0.2
 */
var MooAudioController = new Class({

	Implements: [Options, Events],

	options: {
		pauseAllOnLostWindowFocus: true
	},

	sounds: {},
	currentlyPlaying: [],
	pausedSounds: [],
	pausedByPauseAll: [],

	/**
	 * Constructor.
	 * @param {Object} options
	 */
	initialize: function(options) {
		this.setOptions(options);

		if (this.options.pauseAllOnLostWindowFocus) {
			window.addEvents({
				blur: this.pauseAll.bind(this),
				focus: this.resumeAllPaused.bind(this)
			});
		}
	},

	/**
	 * Registers the audio element with the controller.
	 * Also adds event handlers for common events.
	 * @param {String} audioId Id of the audio element to register.
	 * @returns {MooAudioController}
	 */
	registerAudioElement: function(audioId) {
		var audioElement = document.id(audioId);
		if (audioElement) {
			this.sounds[audioId] = audioElement;
			if (audioElement.hasAttribute('autoplay')) {
				this.currentlyPlaying.push(audioId);
			}
			audioElement.addEventListener('ended', function(event) {
				var audioId = event.target.getAttribute('id');
				this.currentlyPlaying.erase(audioId);
				this.pausedSounds.erase(audioId);
				this.pausedByPauseAll.erase(audioId);
			}.bind(this));
			audioElement.addEventListener('pause', function(event) {
				var audioId = event.target.getAttribute('id');
				this.currentlyPlaying.erase(audioId);
			}.bind(this));
			audioElement.addEventListener('play', function(event) {
				var audioId = event.target.getAttribute('id');
				this.currentlyPlaying.push(audioId);
				this.pausedSounds.erase(audioId);
				this.pausedByPauseAll.erase(audioId);
			}.bind(this));
		}
		return this;
	},

	/**
	 * Starts playback of given audio element.
	 * @param {String|Element} domElementOrId
	 * @returns {MooAudioController}
	 */
	playSound: function(domElementOrId) {
		var audioElement = this.getAudioElement(domElementOrId);
		if (audioElement != null) {
			audioElement.play();
		}
		return this;
	},

	/**
	 * Stops the given audio element.
	 * @param {String|Element} domElementOrId
	 * @returns {MooAudioController}
	 */
	stopSound: function(domElementOrId) {
		var audioElement = this.getAudioElement(domElementOrId);
		if (audioElement != null) {
			audioElement.pause();
			audioElement.currentTime = 0;
		}
		return this;
	},

	/**
	 * Pauses the given audio element. Adds sound to list of paused elements.
	 * If this is NOT intended, use stopSound().
	 * @param {String|Element} domElementOrId
	 * @returns {MooAudioController}
	 * @see stopSound
	 */
	pauseSound: function(domElementOrId) {
		var audioElement = this.getAudioElement(domElementOrId);
		if (audioElement != null) {
			audioElement.pause();
			this.pausedSounds.push(audioElement.getAttribute('id'));
		}
		return this;
	},

	/**
	 * Useful to stop all playing sounds immediately. All the stopped sounds
	 * may also be resumed with resumeAllPaused()
	 * @returns {MooAudioController}
	 * @see resumeAllPaused
	 */
	pauseAll: function() {
		this.currentlyPlaying.each(function(audioId) {
			var audioElement = this.getAudioElement(audioId);
			if (audioElement != null) {
				audioElement.pause();
				this.pausedByPauseAll.push(audioId);
			}
		}, this);
		return this;
	},

	/**
	 * Resumes all paused sounds which have been paused by pauseAll().
	 * @returns {MooAudioController}
	 * @see pauseAll
	 */
	resumeAllPaused: function() {
		this.pausedByPauseAll.each(this.playSound, this);
		this.pausedByPauseAll = [];
		return this;
	},

	/**
	 * Helper method to always get the audio dom element, regardless of id or dom node was given.
	 * @param {String|Element} domElementOrId
	 * @returns {Element} If the audio element has not been registered with the audio controller,
	 *                      null is returned instead.
	 */
	getAudioElement: function(domElementOrId) {
		var audioId;
		if (typeOf(domElementOrId) == "element") {
			audioId = $$(domElementOrId)[0].getAttribute('id');
		} else {
			audioId = domElementOrId;
		}

		if (this.sounds[audioId]) {
			return this.sounds[audioId];
		} else {
			return null;
		}
	}

});