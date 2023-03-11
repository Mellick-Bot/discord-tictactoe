import { EmbedColor } from '@config/types';
import localize from '@i18n/localize';
import AI from '@tictactoe/ai/AI';
import Entity from '@tictactoe/Entity';
import { Player } from '@tictactoe/Player';
import { MessageOptions } from 'fosscord-gopnik';

/**
 * Builds representation of a game board using text emojis
 * whiches will be displayed in a Discord message.
 *
 * @author Utarwyn
 * @since 2.1.0
 */
export default class GameBoardBuilder {
    /**
     * Unicode reactions available for moves.
     */
    public static readonly MOVE_REACTIONS = ['↖️', '⬆️', '↗️', '⬅️', '⏺️', '➡️', '↙️', '⬇️', '↘️'];
    /**
     * Unicode emojis used for representing the two players.
     * @protected
     */
    protected emojies = ['⬜', '🇽', '🅾️'];
    /**
     * Stores game board title message.
     * @protected
     */
    protected title: string;
    /**
     * Stores game current state.
     * @protected
     */
    protected state: string;
    /**
     * Stores game board size.
     * @protected
     */
    protected boardSize: number;
    /**
     * Stores game board data.
     * @protected
     */
    protected boardData: Player[];
    /**
     * Stores embed color if enabled, undefined otherwise.
     * @private
     */
    protected embedColor?: EmbedColor;

    /**
     * Constructs a new game board builder.
     */
    constructor() {
        this.title = '';
        this.state = '';
        this.boardSize = 0;
        this.boardData = [];
    }

    /**
     * Writes a title to the game board message.
     *
     * @param player1 first entity to play
     * @param player2 second entity to play
     * @returns same instance
     */
    public withTitle(player1: Entity, player2: Entity): GameBoardBuilder {
        this.title =
            localize.__('game.title', {
                player1: player1.displayName,
                player2: player2.displayName
            }) + '\n\n';
        return this;
    }

    /**
     * Configures emojies used for representing both entities.
     *
     * @param first emoji of the first entity
     * @param second emoji of the second entity
     * @param none emoji used for an empty cell
     * @returns same instance
     */
    public withEmojies(first: string, second: string, none?: string): GameBoardBuilder {
        this.emojies = [none ?? this.emojies[0], first, second];
        return this;
    }

    /**
     * Writes representation of a game board.
     *
     * @param boardSize size of the board
     * @param board game board data
     * @returns same instance
     */
    public withBoard(boardSize: number, board: Player[]): GameBoardBuilder {
        this.boardSize = boardSize;
        this.boardData = board;
        return this;
    }

    /**
     * Writes that an entity is playing.
     *
     * @param entity entity whiches is playing. If undefined: display loading message
     * @returns same instance
     */
    public withEntityPlaying(entity?: Entity): GameBoardBuilder {
        if (entity instanceof AI) {
            this.state = localize.__('game.waiting-ai');
        } else if (!entity) {
            this.state = localize.__('game.load');
        } else {
            this.state = localize.__('game.action', { player: entity.toString() });
        }
        return this;
    }

    /**
     * Writes ending state of a game.
     *
     * @param winner winning entity. If undefined: display tie message
     * @returns same instance
     */
    public withEndingMessage(winner?: Entity): GameBoardBuilder {
        if (winner) {
            this.state = localize.__('game.win', { player: winner.toString() });
        } else {
            this.state = localize.__('game.end');
        }
        return this;
    }

    /**
     * Writes expiration state of the game.
     *
     * @returns same instance
     */
    public withExpireMessage(): GameBoardBuilder {
        this.state = localize.__('game.expire');
        return this;
    }

    /**
     * Should use an embed to display the game board.
     *
     * @param embedColor color of the embed
     * @returns same instance
     */
    public withEmbed(embedColor: EmbedColor): GameBoardBuilder {
        this.embedColor = embedColor;
        return this;
    }

    /**
     * Constructs final representation of the game board.
     *
     * @returns message options of the gameboard
     */
    public toMessageOptions(): MessageOptions {
        // Generate string representation of the board
        let board = '';

        for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            board += this.emojies[this.boardData[i]] + ' ';
            if ((i + 1) % this.boardSize === 0) {
                board += '\n';
            }
        }

        // Generate final string
        const state = this.state && board ? '\n' + this.state : this.state;
        return {
            allowedMentions: { parse: ['users'] },
            embeds: this.embedColor
                ? [{ title: this.title, description: board + state, color: this.embedColor }]
                : [],
            content: !this.embedColor ? this.title + board + state : undefined,
            components: []
        };
    }
}
