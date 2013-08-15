/**
 * TODOs:
 * - fire events (play, pause, loaded)
 * - add helper method to create audio dom elements
 *
 * @type {Class}
 * @version 0.3
 */
var MooAudioController = new Class({

	Implements: [Options, Events],

	options: {
		pauseAllOnLostWindowFocus: true,
		cookieName: "mooAudio-"
	},

	sounds: {},
	currentlyPlaying: [],
	pausedSounds: [],
	pausedByPauseAll: [],
	isMuted: false,

	/**
	 * Constructor.
	 * @param {Object} options
	 */
	initialize: function(options) {
		this.setOptions(options);
		this.isMuted = Cookie.read(this.options.cookieName + "isMuted") == 1;
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
			if (audioElement.hasAttribute('autoplay') && !this.isMuted) {
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
				if (this.isMuted) {
					this.stopSound(audioId);
					this.pausedByPauseAll.push(audioId);
				} else {
					this.currentlyPlaying.push(audioId);
					this.pausedSounds.erase(audioId);
					this.pausedByPauseAll.erase(audioId);
				}
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
		if (!this.isMuted) {
			if (audioElement != null) {
				audioElement.play();
			}
		} else {
			this.pausedByPauseAll.push(audioElement.getAttribute('id'));
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
		if (!this.isMuted) {
			this.pausedByPauseAll.each(this.playSound, this);
			this.pausedByPauseAll = [];
		}
		return this;
	},

	/**
	 * Sets mute state.
	 * @param {Boolean} newMutedValue True if all sounds should be muted (paused)
	 * @returns {MooAudioController}
	 */
	setMuted: function(newMutedValue) {
		this.isMuted = !!newMutedValue;
		Cookie.write(this.options.cookieName + "isMuted", this.isMuted ? 1 : 0, {duration: 30});
		if (this.isMuted) {
			this.pauseAll();
		} else {
			this.resumeAllPaused();
		}
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