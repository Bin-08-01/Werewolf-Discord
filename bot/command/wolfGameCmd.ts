import {
    ActionRowBuilder,
    ChannelType,
    Events,
    Permissions,
    PermissionsBitField,
    StringSelectMenuBuilder
} from "discord.js";
import {Init} from "../../game/__init__"

let game: any;

export const wolfGameCmd = {
    wolfCmd: (client: any) => {

        client.on('messageCreate', async (interaction: any) => {
            const message = interaction.content.toLowerCase();
            switch (message) {
                case '$wolf':
                    await startGame(interaction, client);
                    break;
                case '$new-text':
                        const temp = await interaction.guild.channels.create({
                            name: "newchannel",
                            type: ChannelType.GuildText,
                            permissionOverwrites: [
                                {
                                    id: interaction.guild.id,
                                    deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                                }
                            ]
                        })
                    break;
                case '$new-voice':
                    await interaction.guild.channels.create({
                        name: "werewolf-voice",
                        type: ChannelType.GuildVoice,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionsBitField.All]
                            }
                        ]
                    })
                    break;
            }
        })


        client.on(Events.InteractionCreate, async (interaction: any) => {
            if (!interaction.isStringSelectMenu()) return;
            const selected = interaction.values[0];
            switch (interaction.customId) {
                case 'select-by-wolf':
                    await interaction.reply("Chọn thành công");
                    await interaction.channel.send(`Người chơi bị vote bởi sói là: ${selected}`);
                    await game.setListByWolf(selected);
                    await game.setKillList(selected);
                    break;
                case 'select-by-witch':
                    const witch = await game.findRole('witch');
                    // const check = witch.checkPoison();
                    if (witch?.checkPoison()) {
                        await game.setKillCertain(selected);
                        await witch.empoison();
                        // console.log(interaction.message.components[0].components);
                        await interaction.update({content: "Phù thuỷ chọn người để đầu độc thành công", components: []});
                        // await interaction.disable(true);
                    } else {
                        await interaction.reply("Bạn đã hết thuốc độc");
                    }
                    break;
                case 'select-by-guard':
                    const check = await game.setProtected(selected);
                    if (!check) {
                        await interaction.reply("Người này đã được bảo vệ ở đêm hôm qua, vui lòng chọn người khác");
                    } else {
                        // await interaction.reply("Đã chọn thành công người để bảo vệ đêm nay");
                        await interaction.update({content: "Đã chọn thành công người để bảo vệ đêm nay", components: []});
                    }
                    break;
                case 'select-by-seer':
                    await game.seerAction(selected);
                    await interaction.update({content: "Đã chọn thành công người để tiên tri đêm nay", components: []});

                    break;
            }

        });


        client.on(Events.InteractionCreate, async (interaction: any) => {
            if (!interaction.isButton()) return;
            const listChooseKillByWitch = await game?.initSelectOption('witch');
            const witch = await game.findRole('witch');
            if (interaction.customId === 'kill-by-witch') {
                if (witch.checkPoison()) {
                    interaction.reply({
                        content: 'Chọn người bạn muôn đầu độc để giết đêm nay: ',
                        components: [listChooseKillByWitch]
                    });
                } else {
                    interaction.reply("Bạn đã hết bình thuốc độc");
                }
            } else if (interaction.customId === 'revival-by-witch') {
                const witch = await game.findRole('witch');
                if (await witch.checkRes()) {
                    const idKilled = game.getKillByWolf();
                    game.setRevList(idKilled);
                    witch.resurrect();
                } else {
                    await interaction.reply("Bạn đã hết thuốc hồi sinh");
                }
            }
        });
    }
}


const startGame = async (interaction: any, client: any) => {
    const message = await interaction.reply({
        content: 'Game đã sẵn sàng, hãy thả like vào tin nhắn này để join game',
        fetchReply: true
    });
    await message.react('👍');
    const filter = (reaction: any, user: any) => {
        return ['👍', '👎'].includes(reaction.emoji.name);
    };

    message.awaitReactions({max: 20, time: 5000})
        .then(async (collected: any) => {
            const reaction = collected.first();
            const players: any[] = [];
            await reaction.users.fetch().then((users: any) => {
                users.forEach((user: any) => {
                    if (!user.bot) {
                        players.push({name: user, id: '869927501634359357'});
                        players.push({name: user, id: '685822823000047669'});
                        players.push({name: user, id: '721564631642144861'});
                        players.push({name: user, id: '688796295871201418'});
                        players.push({name: user, id: '710885118444830740'});
                        players.push({name: user, id: '756049190513279027'});
                    }
                })
            })
            if (players.length) {
                let listPlayer = '';
                players.forEach(each => listPlayer += each.name.username + '\n');
                interaction.reply(`Game có ${players.length} người chơi.\nList player: \n${listPlayer}`);
                game = await new Init(players, interaction, client);
                await game.setRole();
                await game.getListPlayerss();
                await game.start();
            }
        })
        .catch((collected: any) => {
            console.log(collected);
            interaction.channel.send(`Không đủ người chơi, bye!`);
        });
}

