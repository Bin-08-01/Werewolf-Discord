import Player from "./player";

class Witch extends Player {
    private resurrection: 1 | 0 = 1;
    private poison: 1 | 0 = 1;

    constructor(user: object[], id: string) {
        super(user, id, 'witch', true);
    }

    checkRes(): boolean{
        return this.getState() && this.resurrection ? true : false;
    }

    checkPoison(): boolean{
        return this.getState() && this.poison ? true : false;
    }

    resurrect() {
        if (this.resurrection) {
            this.resurrection = 0;
        }
    }

    empoison() {
        if(this.poison){
            this.poison = 0;
        }
    }
}

module.exports = Witch;
