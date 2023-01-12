const Bodyguard = require('./role/bodyguard');
const Seer = require('./role/seer');
const Villager = require('./role/villagers');
const Witch = require('./role/witch');
const Wolf = require('./role/wolf');
const Player = require('./role/player');
const {ActionRowBuilder, Events, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");

export class Init {
    private listAttend: object[] = [];
    private listRole: string[] = ["bodyguard", "witch", "wolf", "wolf", "village", "village",
        "cursed", "hunter", "mayor", "wolf", "diviner", "village"];
    private listPlayer: any[] = [];
    private queueKill: any[] = [];
    private queueKillCertain: any[] = [];
    private queueRev: any[] = [];
    private killByWolf: string = '';
    bot: any;
    private protect: any;
    client: any;

    constructor(listPlayer: any, bot: any, client: any) {
        this.setListPlayer(listPlayer);
        this.bot = bot;
        this.client = client
    }

    setKillByWolf(idPlayer: string) {
        this.killByWolf = idPlayer;
    }

    getKillByWolf(idPlayer: string): string {
        return this.killByWolf;
    }


    setListPlayer(listAttend: any) {
        this.listAttend = listAttend;
    }

    command = async () => {
        await this.bot.reply("Hello, tui gửi từ ma sói");
    }

    setKillCertain(idPlayer: string) {
        this.queueKillCertain.push(idPlayer);
    }

    async setKillList(idPlayer: string) {
        await this.queueKill.push(idPlayer);
    }

    async setRevList(idPlayer: string) {
        await this.queueRev.push(idPlayer);
    }

    getListPlayer() {
        return this.listPlayer;
    }

    getPlayerLife() {
        const data = this.listPlayer.filter((each: any) => each.getState())
        return data;
    }

    addToQueueKill(idPlayer: string) {
        this.queueKill.push(idPlayer);
    }

    addToQueueRev(idPlayer: string) {
        this.queueRev.push(idPlayer);
    }

    async setProtected(protect: string) {
        if (protect !== this.protect) {
            console.log("Protected");
            this.protect = protect;
            return true;
        }
        return false;
    }

    getProtected() {
        return this.protect;
    }

    async handleKill() {
        if (this.queueKill.length > 0) {
            await this.queueKill.forEach((idPlayer: string) => {
                this.listPlayer.forEach((player: any) => {
                    if (idPlayer === player.getId() && idPlayer !== this.protect) {
                        player.setState(false);
                    }
                })
            })
        }
        if (this.queueKillCertain.length > 0) {
            await this.queueKillCertain.forEach((idPlayer: string) => {
                this.listPlayer.forEach((player: any) => {
                    if (idPlayer === player.getId()) {
                        player.setState(false);
                    }
                })
            })
        }
    }

    async handleRev() {
        await this.queueRev.forEach((idPlayer: any) => {
            this.listPlayer.forEach((player: any) => {
                if (idPlayer === player.getId()) {
                    player.setState(true);
                }
            })
        })
    }

    setRole = async () => {
        await this.listAttend.sort(() => Math.random() - 0.5);
        for (let i = 0; i < this.listAttend.length; i++) {
            const each: any = this.listRole[i];
            const player: any = this.listAttend[i];
            switch (each) {
                case 'witch':
                    this.listPlayer.push(await new Witch(player.name, player.id));
                    break;
                case 'village':
                    this.listPlayer.push(await new Villager(player.name, player.id));
                    break;
                case "bodyguard":
                    this.listPlayer.push(await new Bodyguard(player.name, player.id));
                    break;
                case 'wolf':
                    this.listPlayer.push(await new Wolf(player.name, player.id));
                    break;
                case 'seer':
                    this.listPlayer.push(await new Seer(player.name, player.id));
                    break;
            }
        }
        await this.listPlayer.sort(() => Math.random() - 0.5);
    }


    async findRole(role: string) {
        return await this.listPlayer.find(player => player.role === role);
    }

    countGood() {
        let quan = 0;
        this.listPlayer.forEach(each => {
            if (each.getLegit()) {
                quan++;
            }
        })
        return quan;
    }

    getPlayerById(id: string): typeof Player {
        const player = this.listPlayer.filter(each => each.getId() === id);
        return player[0];
    }

    countEvil() {
        let quan = 0;
        this.listPlayer.forEach(each => {
            if (!each.getLegit()) {
                quan++;
            }
        })
        return quan;
    }

    async clear() {
        this.queueRev = [];
        this.queueKill = [];
        this.killByWolf = '';
    }

    checkFinish() {
        return this.countEvil() >= this.countGood();
    }

    sleepTime(second = 0) {
        return new Promise(resolve => setTimeout(resolve, second));
    }

    initSelectOption = async (agent: string) => {                               //Initialize selection menu
        const option: any[] = [];
        await this.listPlayer.forEach(each => {
            if (each.getState()) {
                option.push({label: each.getName().username, value: each.getId()})
            }
        })

        const row = await new ActionRowBuilder()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId(`select-by-${agent}`)
                .setPlaceholder('Choose Someone...')
                .addOptions(
                    option
                ),
            );
        return row;
    }

    async countDown(second: number = 0, message: any) {                            // Function countdown
        const msg = await this.bot.channel.send(`${message}: ${second}s`);
        return new Promise(resolve => {
            let interval = setInterval(async () => {
                await msg.edit(`${message}: ${second--}s`);
                if (second < 0) {
                    resolve(clearInterval(interval));
                }
            }, 1000);
        })
    }

    async start() {
        while (true) {
            const players = this.listPlayer;
            const listProtected = await this.initSelectOption('guard');
            await this.bot.channel.send({content: 'Bạn muốn chọn ai để bảo vệ đêm nay: ', components: [listProtected]});
            // await this.sleepTime(10000);
            await this.countDown(30, "Thời gian bình chọn còn lại");

            // const playerProtect = await this.getProtected();
            // players[0].protect(playerProtect);

            await this.bot.channel.send({content: 'Chọn người để giết đêm nay(sói)'});
            const wolfList = this.listPlayer.filter(each => each.getRole() === 'wolf');  // Find out all players are wolves
            // wolfList.forEach(each => {
            //     this.client.users.fetch(each.getId(), false).then(async (user: any) => await user.send("Hello"));
            // })

            await this.countDown(30, "Thời gian bình chọn còn lại");
            // await this.sleepTime(10000);
            const buttonWitch = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('kill-by-witch')
                        .setLabel('Kill')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('revival-by-witch')
                        .setLabel('Save')
                        .setStyle(ButtonStyle.Primary)
                );
            // const a = await this.findRole('witch');
            // this.client.users.fetch('721564631642144861', false).then(async (user: any) => await user.send({content: `${this.getPlayerById('869927501634359357').getName().username} will die, choose 'Rev' or 'Kill Someone'`,
            //     components: [buttonWitch]}))

            await this.bot.channel.send({
                content: `${this.getPlayerById('869927501634359357').getName().username} will die, choose 'Rev' or 'Kill Someone'`,
                components: [buttonWitch]
            });
            // await this.sleepTime(10000);
            await this.countDown(30, "Thời gian bình chọn còn lại");
            await this.handleKill();
            await this.handleRev();
            await this.getListPlayerss();
            await this.clear();
        }
    }

    getListPlayerss = async () => {
        let a = '';
        await this.listPlayer.forEach(each => {
            if (each.getState()) {
                a += each.getName().username + ", role =" + each.getRole() + "\n";
            }
        })
        this.bot.channel.send(a);
    }

}

