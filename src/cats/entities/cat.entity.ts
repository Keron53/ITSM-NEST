import { Breed } from "src/breeds/entities/breed.entity";
import { Column, DeleteDateColumn, Entity, ManyToOne } from "typeorm";

@Entity()
export class Cat {

    @Column({ primary: true, generated: true })
    id: number;

    @Column()
    name: string;

    @Column()
    age: number;

    @ManyToOne(() => Breed, (breed) => breed.id, {
        // cascade: true,
        eager: true, // para que traiga las raza al hacer un findOne
    })
    breed: Breed;

    @DeleteDateColumn()
    deleteAt: Date;
}


