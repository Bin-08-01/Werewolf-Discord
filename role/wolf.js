const Player = require('./player');

class Wolf extends Player {
    #targetKill;
    constructor(user, id) {
        super(user, id);
        this.setRole('wolf');
        this.setLegit(false);
    }

    kill(id12Kill) {
        this.#targetKill = id12Kill;
    }

    getTargetKill() {
        return this.#targetKill;
    }
}

module.exports = Wolf;